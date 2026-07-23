"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";
import { markInvoicePaid } from "@/lib/panel/invoices/actions";
import { parseBankStatement, type BankTxn } from "./parse";

const digits = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");

/** One of a client's open invoices, with a FIFO-suggested settlement amount. */
export type ReconcileCandidate = {
  invoiceId: string;
  series: string;
  number: string;
  issuedDate: string;
  total: number;
  outstanding: number;
  /** Amount the greedy oldest-first pass proposes to apply (0 = not suggested). */
  suggested: number;
  scope: "conta1" | "conta2";
};

/** An incoming bank transfer matched (or not) to a client + candidate invoices. */
export type ReconcileTxn = {
  reference: string;
  date: string;
  amount: number;
  currency: string;
  counterpartyName: string;
  counterpartyFiscal: string;
  /** True when this bank reference was already applied in a prior import. */
  alreadyApplied: boolean;
  /** True when the fiscal code matched at least one open invoice. */
  clientMatched: boolean;
  candidates: ReconcileCandidate[];
  /** amount − Σ suggested: money the FIFO pass couldn't place on an invoice. */
  unassigned: number;
};

export type PreviewResult =
  | {
      ok: true;
      account: string;
      currency: string;
      incoming: ReconcileTxn[];
      skippedOutgoing: number;
    }
  | { ok: false; reason: string };

type OpenInvoice = {
  id: string;
  series: string | null;
  number: string | null;
  issued_date: string;
  total: number | null;
  paid_amount: number | null;
  currency: string | null;
  account_scope: "conta1" | "conta2" | null;
  customer_snapshot: { idno?: string | null; name?: string | null } | null;
};

/**
 * Build the FIFO (oldest-first) settlement suggestion for one payment against a
 * client's open invoices: fully settle the oldest until the money runs out, and
 * partial-fill the one it stops on. Pure — the operator can override every tick.
 */
function suggestFifo(
  amount: number,
  invoices: OpenInvoice[],
): { candidates: ReconcileCandidate[]; unassigned: number } {
  let remaining = amount;
  const candidates: ReconcileCandidate[] = invoices
    .slice()
    .sort((a, b) => a.issued_date.localeCompare(b.issued_date))
    .map((inv) => {
      const total = Number(inv.total ?? 0);
      const outstanding = Number((total - Number(inv.paid_amount ?? 0)).toFixed(2));
      let suggested = 0;
      if (remaining > 0.01 && outstanding > 0) {
        suggested = Math.min(remaining, outstanding);
        suggested = Number(suggested.toFixed(2));
        remaining = Number((remaining - suggested).toFixed(2));
      }
      return {
        invoiceId: inv.id,
        series: inv.series ?? "",
        number: inv.number ?? "",
        issuedDate: inv.issued_date,
        total,
        outstanding,
        suggested,
        scope: (inv.account_scope ?? "conta1") as "conta1" | "conta2",
      };
    });
  return { candidates, unassigned: Number(Math.max(0, remaining).toFixed(2)) };
}

/**
 * Parse a bank statement and, for every INCOMING transfer, match the payer to a
 * client by fiscal code and propose which open invoices it settles (oldest
 * first). Nothing is written — this is the review step behind the confirm UI.
 */
export async function previewBankStatement(
  xmlText: string,
): Promise<PreviewResult> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  let parsed;
  try {
    parsed = parseBankStatement(xmlText);
  } catch {
    return { ok: false, reason: "invalid_xml" };
  }

  const incomingTxns = parsed.transactions.filter((t) => t.direction === "in");
  const skippedOutgoing = parsed.transactions.length - incomingTxns.length;
  if (incomingTxns.length === 0) {
    return {
      ok: true,
      account: parsed.account,
      currency: parsed.currency,
      incoming: [],
      skippedOutgoing,
    };
  }

  const supabase = await createClient();
  // Open invoices in the statement currency — the pool we can settle against.
  const { data: openRows } = await supabase
    .from("invoices")
    .select(
      "id, series, number, issued_date, total, paid_amount, currency, account_scope, customer_snapshot",
    )
    .eq("type", "invoice")
    // "partial" is a valid runtime status the generated union doesn't list yet.
    .in("status", ["issued", "partial"] as unknown as ["issued"])
    .eq("currency", parsed.currency)
    .order("issued_date", { ascending: true });
  const open = ((openRows ?? []) as unknown as OpenInvoice[]).filter(
    (r) => Number(r.total ?? 0) - Number(r.paid_amount ?? 0) > 0.01,
  );

  // Which bank references were already applied (double-import guard).
  const refs = incomingTxns.map((t) => t.reference);
  const admin = getSupabaseAdmin();
  const { data: appliedRows } = await admin
    .from("bank_payments")
    .select("bank_reference")
    .in("bank_reference", refs);
  const applied = new Set(
    ((appliedRows ?? []) as Array<{ bank_reference: string }>).map(
      (r) => r.bank_reference,
    ),
  );

  const incoming: ReconcileTxn[] = incomingTxns.map((t: BankTxn) => {
    const fiscal = t.counterpartyFiscal;
    const mine = fiscal
      ? open.filter((inv) => digits(inv.customer_snapshot?.idno) === fiscal)
      : [];
    const { candidates, unassigned } = suggestFifo(t.amount, mine);
    return {
      reference: t.reference,
      date: t.date,
      amount: t.amount,
      currency: parsed.currency,
      counterpartyName: t.counterpartyName,
      counterpartyFiscal: fiscal,
      alreadyApplied: applied.has(t.reference),
      clientMatched: mine.length > 0,
      candidates,
      unassigned,
    };
  });

  return {
    ok: true,
    account: parsed.account,
    currency: parsed.currency,
    incoming,
    skippedOutgoing,
  };
}

export type ApplyTxn = {
  reference: string;
  date: string;
  amount: number;
  currency: string;
  counterpartyName: string;
  counterpartyFiscal: string;
  account: string;
  allocations: Array<{
    invoiceId: string;
    series: string;
    number: string;
    amount: number;
  }>;
};

export type ApplyResult =
  | {
      ok: true;
      appliedTxns: number;
      appliedInvoices: number;
      skipped: string[];
    }
  | { ok: false; reason: string };

/**
 * Apply the operator-confirmed allocations: mark each ticked invoice paid/
 * partial (via markInvoicePaid, method "transfer") and log the transaction to
 * bank_payments. The unique `bank_reference` makes re-imports a no-op — a
 * reference already logged is skipped, never re-applied.
 */
export async function applyBankReconciliation(payload: {
  transactions: ApplyTxn[];
}): Promise<ApplyResult> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!payload?.transactions?.length) return { ok: false, reason: "empty" };

  const admin = getSupabaseAdmin();
  const skipped: string[] = [];
  let appliedTxns = 0;
  let appliedInvoices = 0;

  for (const txn of payload.transactions) {
    const allocations = (txn.allocations ?? []).filter((a) => a.amount > 0);
    if (allocations.length === 0) continue;

    // Guard: skip if this exact bank reference was already applied.
    const { data: existing } = await admin
      .from("bank_payments")
      .select("id")
      .eq("bank_reference", txn.reference)
      .maybeSingle();
    if (existing) {
      skipped.push(txn.reference);
      continue;
    }

    const currency = (["MDL", "EUR", "USD"].includes(txn.currency)
      ? txn.currency
      : "MDL") as "MDL" | "EUR" | "USD";
    const paidAt = /^\d{4}-\d{2}-\d{2}$/.test(txn.date)
      ? txn.date
      : new Date().toISOString().slice(0, 10);

    const done: ApplyTxn["allocations"] = [];
    for (const a of allocations) {
      const res = await markInvoicePaid(a.invoiceId, {
        paid_at: paidAt,
        amount: Number(a.amount.toFixed(2)),
        currency,
        method: "transfer",
      });
      if (res.ok) {
        appliedInvoices += 1;
        done.push(a);
      }
    }
    if (done.length === 0) continue;

    // Log the applied transaction (audit + double-import guard). Best-effort:
    // if the migration hasn't run, the invoices are still correctly marked.
    const { error: logErr } = await admin.from("bank_payments").insert({
      bank_reference: txn.reference,
      statement_account: txn.account ?? null,
      tx_date: paidAt,
      amount: Number(txn.amount.toFixed(2)),
      currency,
      counterparty_name: txn.counterpartyName ?? null,
      counterparty_fiscal: txn.counterpartyFiscal ?? null,
      allocations: done as unknown as object,
      applied_by: user.id,
    } as never);
    if (logErr) {
      console.warn(
        "[reconciliation] bank_payments log skipped (run sql/bank-reconciliation.sql):",
        logErr.message,
      );
    }
    appliedTxns += 1;
  }

  revalidatePath("/[locale]/panel/facturi", "page");
  return { ok: true, appliedTxns, appliedInvoices, skipped };
}
