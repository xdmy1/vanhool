/**
 * Parser for the Moldovan "Extras" bank-statement XML (Agroindbank / MAIB
 * format — <Extras><head/><documents><document/>…</documents></Extras>).
 *
 * Pure, dependency-free, no I/O — safe to unit-test and to run on the server.
 * We hand-roll it instead of pulling an XML dependency: the format is flat,
 * bank-generated and stable, and this keeps the money path auditable.
 *
 * Direction & counterparty (verified against a real statement):
 *   • Incoming (credit, s_c > 0): the PAYER is on the `p*` side, we are `b*`.
 *   • Outgoing (debit,  s_d > 0): the PAYEE is on the `b*` side, we are `p*`.
 * So the counterparty (the external party we match to a client) is the p-side
 * for incoming and the b-side for outgoing.
 */

export type BankTxn = {
  /** Bank's unique transaction reference (e.g. "FT262020175571"). */
  reference: string;
  /** Document date (YYYY-MM-DD) from da_dok, falling back to da_extr. */
  date: string;
  /** "in" = money received (customer payment), "out" = money we paid. */
  direction: "in" | "out";
  /** Absolute amount in the statement currency (always positive). */
  amount: number;
  /** Counterparty display name, with the "(R) " routing prefix stripped. */
  counterpartyName: string;
  /** Counterparty fiscal code / IDNO (digits) — the reliable match anchor. */
  counterpartyFiscal: string;
  /** Counterparty IBAN, if present. */
  counterpartyIban: string;
  /** Free-text payment description (bank inserts stray spaces; kept raw). */
  description: string;
};

export type BankStatement = {
  /** Account number from <head><cont>. */
  account: string;
  /** Statement currency — this format is single-currency per file (MDL). */
  currency: string;
  transactions: BankTxn[];
};

function tag(block: string, name: string): string {
  // Non-greedy, tolerant of surrounding whitespace. Returns "" when absent.
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1].trim() : "";
}

function num(s: string): number {
  const n = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function stripRouting(name: string): string {
  // Bank prefixes counterparties with "(R) " (routing marker) — drop it.
  return name.replace(/^\(R\)\s*/i, "").trim();
}

/**
 * Parse a statement XML string. Throws `Error("invalid_xml")` if the root
 * marker is missing so the caller can surface a clean message.
 */
export function parseBankStatement(
  xml: string,
  currencyHint = "MDL",
): BankStatement {
  if (!xml || !/<Extras[\s>]/i.test(xml)) {
    throw new Error("invalid_xml");
  }
  const account = tag(xml, "cont");

  const transactions: BankTxn[] = [];
  const docRe = /<document>([\s\S]*?)<\/document>/gi;
  let m: RegExpExecArray | null;
  while ((m = docRe.exec(xml)) !== null) {
    const b = m[1];
    const debit = num(tag(b, "s_d"));
    const credit = num(tag(b, "s_c"));
    const direction: "in" | "out" = credit > 0 ? "in" : "out";
    const amount = credit > 0 ? credit : debit;
    if (amount <= 0) continue; // skip zero/informational rows

    const counterpartyName = stripRouting(
      direction === "in" ? tag(b, "pname") : tag(b, "bname"),
    );
    const counterpartyFiscal = (
      direction === "in" ? tag(b, "pkd_fisk") : tag(b, "bkd_fisk")
    ).replace(/\D/g, "");
    const counterpartyIban =
      direction === "in" ? tag(b, "piban") : tag(b, "biban");

    transactions.push({
      reference: tag(b, "reference") || `${tag(b, "nr_dok")}-${tag(b, "da_dok")}`,
      date: tag(b, "da_dok") || tag(b, "da_extr"),
      direction,
      amount,
      counterpartyName,
      counterpartyFiscal,
      counterpartyIban,
      description: tag(b, "description"),
    });
  }

  return { account, currency: currencyHint, transactions };
}
