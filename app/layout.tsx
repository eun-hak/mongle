import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const serif = Noto_Serif_KR({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const BASE_URL = "https://mongle.plentyer.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "몽글 — 꿈해몽 사전",
    template: "%s | 몽글",
  },
  description:
    "뱀꿈, 이빨 빠지는 꿈, 물꿈 등 자주 찾는 꿈의 의미를 전통 해몽 자료 기반으로 정리한 사전형 레퍼런스 사이트입니다.",
  keywords: ["꿈해몽", "꿈풀이", "해몽", "꿈사전", "태몽"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "몽글",
    title: "몽글 — 꿈해몽 사전",
    description:
      "뱀꿈, 이빨 빠지는 꿈, 물꿈 등 자주 찾는 꿈의 의미를 정리한 사전형 꿈해몽 레퍼런스.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "몽글 — 꿈해몽 사전",
    description: "어젯밤 꿈, 무슨 의미일까요? 실제 질문 데이터로 정리한 꿈사전.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "./" },
};

export const viewport = {
  themeColor: "#171233",
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "몽글",
  alternateName: "몽글 꿈해몽 사전",
  url: BASE_URL,
  description: "실제 질문 데이터로 정리한 꿈해몽 사전",
  inLanguage: "ko",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
