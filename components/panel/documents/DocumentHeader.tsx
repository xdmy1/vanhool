import { Logo } from "@/components/layout/Logo";

import type { CompanyInfo } from "@/lib/panel/settings/company";

type Props = {
  documentType: "proforma" | "invoice" | "purchase_order";
  documentTitle: string;
  documentNumberLabel: string;
  documentNumber: string;
  issuedDate: string;
  dueDate?: string | null;
  paidBadge?: string | null;
  company: CompanyInfo;
};

/**
 * Top section of a printable document: company logo + name + meta box on the
 * right with title + number + dates. Used by Proforma / Invoice / PO prints.
 */
export function DocumentHeader({
  documentType,
  documentTitle,
  documentNumberLabel,
  documentNumber,
  issuedDate,
  dueDate,
  paidBadge,
  company,
}: Props) {
  const colorClass = "text-black";
  return (
    <header className="mb-6 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <Logo className="h-12 w-auto text-black" />
        <div>
          <div className="text-xl font-bold">{company.name}</div>
          <div className="text-xs text-gray-700">{company.legal_name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`inline-flex items-center gap-2 ${colorClass}`}>
          <div className="text-2xl font-bold">{documentTitle}</div>
          {paidBadge ? (
            <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success" style={{ background: "#dcfce7", color: "#16a34a" }}>
              {paidBadge}
            </span>
          ) : null}
        </div>
        <div className="mt-2 text-sm">
          <span className="text-gray-500">{documentNumberLabel} </span>
          <span className="font-mono font-semibold">{documentNumber}</span>
        </div>
        <div className="text-xs text-gray-700">{issuedDate}</div>
        {dueDate ? <div className="text-xs text-gray-700">{dueDate}</div> : null}
      </div>
    </header>
  );
}
