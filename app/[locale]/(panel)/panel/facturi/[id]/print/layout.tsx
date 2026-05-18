import { DocumentPrintShell } from "@/components/panel/documents/DocumentPrintLayout";

export default function InvoicePrintLayout({ children }: { children: React.ReactNode }) {
  return <DocumentPrintShell>{children}</DocumentPrintShell>;
}
