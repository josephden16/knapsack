import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KnapSack — Campaign Reporting Platform",
  description: "Funnel-Based Campaign Reporting Platform · OPay Marketing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
