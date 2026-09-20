import { DocumentPrintShell } from "@/components/panel/documents/DocumentPrintLayout";

export default function ReturnPrintLayout({ children }: { children: React.ReactNode }) {
  return <DocumentPrintShell>{children}</DocumentPrintShell>;
}
