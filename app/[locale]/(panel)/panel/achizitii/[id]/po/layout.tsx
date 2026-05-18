import { DocumentPrintShell } from "@/components/panel/documents/DocumentPrintLayout";

export default function POPrintLayout({ children }: { children: React.ReactNode }) {
  return <DocumentPrintShell>{children}</DocumentPrintShell>;
}
