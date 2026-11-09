import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MyLink - 나만의 올인원 프로필 링크",
    template: "%s | MyLink",
  },
  description:
    "흩어져 있던 나의 모든 링크를 하나로. 실시간 클릭 통계와 모던한 디자인의 프로필 링크 서비스 MyLink",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://mylink-hez5.vercel.app"
  ),
  openGraph: {
    title: "MyLink - 나만의 올인원 프로필 링크",
    description:
      "흩어져 있던 나의 모든 링크를 하나로. 실시간 클릭 통계와 모던한 디자인의 프로필 링크 서비스 MyLink",
    url: "https://mylink-hez5.vercel.app",
    siteName: "MyLink",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - 나만의 올인원 프로필 링크",
    description:
      "흩어져 있던 나의 모든 링크를 하나로. 실시간 클릭 통계와 모던한 디자인의 프로필 링크 서비스 MyLink",
  },
  verification: {
    other: {
      "naver-site-verification": "135537099b68dff908a248cf7b1c25b6",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
