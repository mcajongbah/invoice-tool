"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { InvoiceProvider } from "@/context/InvoiceContext";

export default function Home() {
  return (
    <InvoiceProvider>
      <div className="h-screen grid grid-cols-1 md:grid-cols-5 overflow-hidden print:block">
        <aside className="md:col-span-2 border-r bg-card h-full overflow-hidden print:hidden">
          <InvoiceForm />
        </aside>
        <main className="md:col-span-3 h-full overflow-auto w-full print:w-full">
          <InvoicePreview />
        </main>
      </div>
    </InvoiceProvider>
  );
}
