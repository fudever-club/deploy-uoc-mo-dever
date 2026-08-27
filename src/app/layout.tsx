import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Deploy Ước Mơ — FU-DEVER Club Day 2026",
  description:
    "Gửi gắm ước mơ của bạn bay lên bầu trời cùng CLB Lập trình FU-DEVER tại FPT University Đà Nẵng. Nhận ngay thiệp Dream Card cá nhân hoá xinh đẹp!",
  keywords: ["FU-DEVER", "Deploy Ước Mơ", "Club Day 2026", "FPT University Da Nang", "Lập trình", "Sinh viên K22"],
  authors: [{ name: "FU-DEVER Tech Team" }],
  openGraph: {
    title: "Deploy Ước Mơ — FU-DEVER Club Day 2026",
    description: "Thả đèn lồng ước mơ và nhận thiệp Dream Card phong cách Trung Thu độc quyền từ FU-DEVER.",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/assets/logo/logo-dever.png",
        width: 1200,
        height: 630,
        alt: "FU-DEVER Deploy Ước Mơ",
      },
    ],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/logo/logo-icon.png",
    apple: "/assets/logo/logo-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#993c1d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-screen flex flex-col bg-[#fffdfa] text-[#2c2c2a] antialiased selection:bg-[#fac775] selection:text-[#712b13]">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
