import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import { PwaRegister } from "@/components/shared/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KasPL - Kelola Penjualan Kelas dengan Mudah",
  description: "Aplikasi Point of Sale (POS), Penjualan & Manajemen Inventaris Koperasi Sekolah",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "KasPL",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} font-sans antialiased`}
    >
      <body className="min-h-screen bg-background">
        <MainLayout>{children}</MainLayout>
        <PwaRegister />
      </body>
    </html>
  );
}
