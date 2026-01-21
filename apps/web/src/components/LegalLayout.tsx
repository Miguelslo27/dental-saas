import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-500 mb-8">
            Última actualización: {lastUpdated}
          </p>
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
