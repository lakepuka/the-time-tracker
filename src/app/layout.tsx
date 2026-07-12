import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Time Trackers",
  description: "A simple, local-only time tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Time Trackers",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
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
    <html lang="en" className={`${rubik.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script must run before paint to prevent a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
