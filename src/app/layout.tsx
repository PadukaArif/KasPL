import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KasPL - Kelola Penjualan Kelas dengan Mudah",
  description: "Aplikasi pencatatan penjualan produk untuk kelas.",
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
      </body>
    </html>
  );
}
