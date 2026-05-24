import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Inbox AI — Gmail triage, automated",
  description: "AI reads every new Gmail and routes it to action items, invoices, subscriptions, or FYI. Built with Next.js and GPT-5-mini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${dmSans.className}`}>
        {children}
      </body>
    </html>
  );
}
