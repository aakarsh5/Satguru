import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { siteConfig } from "@/lib/config"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: { icon: "/favicon.png" },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale.replace("-", "_"),
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
