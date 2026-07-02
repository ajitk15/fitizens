import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { getSite, getTrainer } from "@/lib/content";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Apply the stored theme before paint — no flash. Dark is the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('fitizens_theme')==='light')document.documentElement.classList.add('light')}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-ink text-fg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
