import type { Metadata } from "next";
import { Inria_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inria = Inria_Serif({
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-inria",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simmsreeve.com"),
  title: "Joe Reeve, Proactivist & Technologist",
  description:
    "I left school at 16 to write code. I now co-found Forest City and Looking for Growth, and I work on Growth at ElevenLabs.",
  openGraph: {
    title: "Joe Reeve, Proactivist & Technologist",
    description: "Technology, Politics, Optimism.",
    url: "https://simmsreeve.com",
    type: "website",
    images: [{ url: "/joe-reeve.webp" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${inria.variable} h-full antialiased`}>
      <body className={`${inria.className} min-h-full flex flex-col bg-white text-black`}>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LRH4KC06NV"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-LRH4KC06NV');`}
        </Script>
        <Script
          src="https://scripts.simpleanalyticscdn.com/latest.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
