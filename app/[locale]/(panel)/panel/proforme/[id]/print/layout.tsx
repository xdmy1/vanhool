import { DocumentPrintShell } from "@/components/panel/documents/DocumentPrintLayout";

export default function ProformaPrintLayout({ children }: { children: React.ReactNode }) {
  return <DocumentPrintShell>{children}</DocumentPrintShell>;
}
