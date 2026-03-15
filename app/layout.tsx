import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Analyst OS",
  description: "An AI business analyst workspace for idea structuring, clarification, and artifact generation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden font-body antialiased">{children}</body>
    </html>
  );
}
