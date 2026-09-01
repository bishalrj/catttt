import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cat® VisionLink® - Smart Rental & Fleet Telematics",
  description: "Caterpillar heavy machinery telematics and intelligent fleet rental management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex h-screen bg-[#0f1216] text-[#f3f4f6] overflow-hidden`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
