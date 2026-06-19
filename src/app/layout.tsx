import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyCTA } from "@/components/StickyCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { site, trainer } from "@/content/site";

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${trainer.brand}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: trainer.fullName }],
  creator: trainer.fullName,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: trainer.brand,
    title: site.title,
    description: site.description,
    images: [{ url: site.ogImage, width: 720, height: 1280, alt: trainer.fullName }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [site.ogImage],
  },
};

/** JSON-LD structured data: Person + LocalBusiness for local SEO. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: trainer.fullName,
      jobTitle: trainer.tagline,
      description: trainer.shortBio,
      image: `${site.url}${trainer.profileImage}`,
      email: `mailto:${trainer.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
      sameAs: ["https://www.instagram.com/satya_muddena"],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}#business`,
      name: trainer.brand,
      description: site.description,
      image: `${site.url}${trainer.profileImage}`,
      url: site.url,
      email: trainer.email,
      telephone: `+${trainer.whatsapp}`,
      areaServed: "Worldwide (online coaching)",
      address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyCTA />
        <WhatsAppButton />
      </body>
    </html>
  );
}
