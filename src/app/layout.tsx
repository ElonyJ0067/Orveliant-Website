import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBotLazy } from "@/components/ChatBotLazy";
import { VisitTracker } from "@/components/VisitTracker";
import { SITE } from "@/lib/site";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  // Hero + headings only — drop light weights from the critical path.
  weight: ["600", "700", "800"],
  display: "swap",
  preload: true,
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  // Body text can swap in; don't block first paint on the body face.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oceanparkasset.com"),
  title: {
    default: "Ocean Park Asset — Disciplined AI Crypto Trading, Staking & Hybrid",
    template: "%s · Ocean Park Asset",
  },
  description:
    "Ocean Park Asset is a risk-controlled AI investment platform. Choose AI Quant Trading, Staking, or an intelligent Hybrid strategy — capital growth engineered with strict, automated risk control.",
  keywords: [
    "AI trading",
    "crypto staking",
    "quant trading",
    "risk-controlled trading",
    "Ocean Park Asset",
    "hybrid crypto strategy",
  ],
  openGraph: {
    title: "Ocean Park Asset — Disciplined AI Crypto Trading, Staking & Hybrid",
    description:
      "Risk-controlled AI investing across Trading, Staking and Hybrid strategies.",
    url: "https://oceanparkasset.com",
    siteName: "Ocean Park Asset",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Park Asset — Disciplined AI Crypto Trading, Staking & Hybrid",
    description:
      "Risk-controlled AI investing across Trading, Staking and Hybrid strategies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ocean Park Asset",
    url: "https://oceanparkasset.com",
    logo: "https://oceanparkasset.com/logo.png",
    description:
      "Disciplined, risk-controlled AI investing across Trading, Staking and Hybrid strategies.",
    slogan: "Built to Act on Opportunity. Engineered to Control Risk.",
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santa Monica",
      addressRegion: "CA",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: SITE.location,
    },
    sameAs: [SITE.social.linkedin, SITE.social.github],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${ibmPlexSans.variable} h-full`}>
      <head>
        {/* LCP: hero poster before video bytes */}
        <link
          rel="preload"
          as="image"
          href="/hero-poster.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preload" as="image" href="/logo.webp" type="image/webp" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ChatBotLazy />
        <VisitTracker />
      </body>
    </html>
  );
}
