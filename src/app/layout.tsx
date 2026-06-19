import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyCTA } from "@/components/StickyCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Analytics } from "@/components/Analytics";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { getSite, getTrainer } from "@/sanity/queries";

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

export async function generateMetadata(): Promise<Metadata> {
  const [site, trainer] = await Promise.all([getSite(), getTrainer()]);
  return {
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
}

/** JSON-LD structured data: Person + LocalBusiness for local SEO. */
function buildJsonLd(
  site: Awaited<ReturnType<typeof getSite>>,
  trainer: Awaited<ReturnType<typeof getTrainer>>,
) {
  // Profile image may be a bundled "/images/.." path or an absolute Sanity URL.
  const image = trainer.profileImage.startsWith("http")
    ? trainer.profileImage
    : `${site.url}${trainer.profileImage}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: trainer.fullName,
        jobTitle: trainer.tagline,
        description: trainer.shortBio,
        image,
        email: `mailto:${trainer.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
        sameAs: ["https://www.instagram.com/satya_muddena"],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${site.url}#business`,
        name: trainer.brand,
        description: site.description,
        image,
        url: site.url,
        email: trainer.email,
        telephone: `+${trainer.whatsapp}`,
        areaServed: "Worldwide (online coaching)",
        address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [site, trainer] = await Promise.all([getSite(), getTrainer()]);
  const jsonLd = buildJsonLd(site, trainer);
  const { isEnabled: isDraft } = await draftMode();
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
        {isDraft && <VisualEditing />}
        <Analytics />
      </body>
    </html>
  );
}
