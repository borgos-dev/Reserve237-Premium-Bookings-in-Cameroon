import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { FavoritesSync } from "@/components/FavoritesSync";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Reserve237 — Book Restaurants, Hotels & More in Cameroon",
    template: "%s | Reserve237",
  },
  description:
    "Reserve237 is Cameroon's booking platform. Find and book restaurants, hotels, salons, event venues and more in Yaoundé, Douala and beyond. Pay via MTN MoMo or Orange Money.",
  keywords: [
    "cameroon booking", "réservation cameroun", "restaurant yaoundé", "hôtel douala",
    "reserve237", "booking cameroon", "MTN MoMo payment", "yaoundé restaurant",
    "douala hotel", "salle événement cameroun",
  ],
  authors: [{ name: "Reserve237" }],
  creator: "Reserve237",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://reserve237.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_CM",
    alternateLocale: "fr_CM",
    siteName: "Reserve237",
    title: "Reserve237 — Book Restaurants, Hotels & More in Cameroon",
    description:
      "Find and book the best restaurants, hotels, salons and event venues across Cameroon. Pay via MTN MoMo or Orange Money.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reserve237 — Cameroon Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve237 — Book Restaurants, Hotels & More in Cameroon",
    description:
      "Find and book the best restaurants, hotels, salons and event venues across Cameroon.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ClerkProvider>
          <ThemeProvider>
            <LanguageProvider>
              <FavoritesSync />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
