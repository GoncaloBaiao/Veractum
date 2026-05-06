import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veractum — See clearly. Think freely.",
  description:
    "AI-powered YouTube video analysis. Paste a link, get a structured summary, extracted claims, and AI fact-checking with sources and confidence scores.",
  keywords: [
    "fact-checking",
    "YouTube analysis",
    "AI summary",
    "video analysis",
    "claim extraction",
    "Veractum",
    "truth",
    "misinformation",
  ],
  authors: [{ name: "Veractum" }],
  openGraph: {
    title: "Veractum — See clearly. Think freely.",
    description:
      "Paste a YouTube link. Get a structured summary, extracted claims, and AI fact-checking with sources.",
    url: "https://veractum.app",
    siteName: "Veractum",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veractum — See clearly. Think freely.",
    description:
      "AI-powered YouTube video analysis and fact-checking with sources.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/WizeApple.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const shouldLoadGa = process.env.NODE_ENV === "production" && Boolean(gaId);
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-gray-100 antialiased font-sans min-h-screen flex flex-col">
        {shouldLoadGa ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
