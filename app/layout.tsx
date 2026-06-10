import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/providers"; // Import Providers yang udah lu bikin

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Udah di-update biar tab browsernya kelihatan profesional
export const metadata: Metadata = {
  title: "Portal Logistik | Irmala",
  description: "Sistem Manajemen Inventaris dan Peminjaman Barang Karang Taruna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id" // Ganti ke 'id' biar sesuai bahasa webnya
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Bungkus aplikasi dengan Session Provider */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}