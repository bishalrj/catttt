import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cat® VisionLink® — Smart Rental & Fleet Telematics",
  description:
    "Caterpillar heavy machinery telematics, intelligent fleet rental management, and predictive AI analytics powered by Cat® VisionLink® 2.0",
  keywords: ["Caterpillar", "VisionLink", "fleet telematics", "equipment rental", "Cat FleetAI"],
  themeColor: "#ffcd11",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} flex h-screen bg-[#0d1117] text-[#f3f4f6] overflow-hidden`}
        style={{ fontFamily: "var(--font-inter), 'Inter', -apple-system, sans-serif" }}
      >
        <ToastProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
