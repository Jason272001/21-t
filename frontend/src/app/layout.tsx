import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { brand } from "@/lib/brand";
import { getLanguage } from "@/lib/i18n-server";
import { cookies } from "next/headers";
import { resolveTheme, themeCookie } from "@/lib/theme";
import { SiteChrome } from "@/components/layout/site-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${brand.shortName} | ${brand.name}`,
    template: `%s | ${brand.shortName}`,
  },
  description: brand.description,
  openGraph: {
    title: `${brand.name} - Burmese Technology Education`,
    description: brand.tagline,
    type: "website",
    locale: "my_MM",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getLanguage();
  const theme = resolveTheme((await cookies()).get(themeCookie)?.value);
  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome header={<Header locale={locale} theme={theme} />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
