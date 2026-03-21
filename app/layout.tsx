import type { Metadata } from "next";
import "@/app/globals.css";
import { LandingTheme } from "@/components/landing-theme";

export const metadata: Metadata = {
  title: "VINCENT — Premium BI Analytics with AI",
  description:
    "Premium BI analytics powered by AI. Transform raw data into actionable insights from source to dashboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">
        <LandingTheme />
        {children}
      </body>
    </html>
  );
}
