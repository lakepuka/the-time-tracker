import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

/* Sans for text and buttons, mono for every numeral and ledger label. */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://the-time-tracker.lakepuka.com";
const TITLE = "The Time Tracker — Local-only work-hours & habit tracker";
const DESCRIPTION =
  "Track work hours and daily habits in a free, local-only PWA. One-tap start/stop, no account or sign-up, works offline, and exports to CSV — your data never leaves your browser.";

export const metadata: Metadata = {
  // The single canonical origin. Records live in localStorage, which is scoped
  // per origin, so the app must only ever be reachable from one hostname.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "The Time Tracker",
  keywords: [
    "time tracker",
    "work hours tracker",
    "timesheet",
    "habit tracker",
    "local-first",
    "offline PWA",
    "no account",
    "privacy",
    "CSV export",
    "free time tracking",
  ],
  authors: [{ name: "lakepuka", url: SITE_URL }],
  creator: "lakepuka",
  category: "productivity",
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "The Time Tracker",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Time Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Time Tracker",
  },
};

// Structured data so search engines can surface this as a free web application.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The Time Tracker",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript and localStorage.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isAccessibleForFree: true,
  inLanguage: ["en", "ja"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f151c" },
  ],
};

const COLOR_SCHEME_INIT_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem("work-timer-color-scheme");
    var isDark = mode === "dark" || (mode !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script must run before paint to prevent a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static structured-data JSON for search engines
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
