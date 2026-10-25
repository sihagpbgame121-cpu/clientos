import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: "ClientOS: From WhatsApp chaos to approved & paid",
  description: "Feedback, revisions and approvals in one workspace built for freelance video editors.",
};

const appleStack = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", ${inter.style.fontFamily}, "Segoe UI", system-ui, sans-serif`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body style={{ fontFamily: appleStack, textRendering: "optimizeLegibility" }}
        className="min-h-screen overflow-x-hidden bg-[#0a0a0b] text-zinc-100 antialiased selection:bg-indigo-500/40">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
