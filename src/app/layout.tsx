import type { Metadata } from "next";
import { Actor } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
const inter = Actor({ weight: ["400"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DATSProject - Agung Faucet",
  description: "Agung Test Network faucet prepared with the contributions of DATSProject.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          src="/umami.js"
          data-website-id="0d77b307-3e60-4821-af5d-4edc50bc936e"
        />
      </head>
      <body className={`${inter.className} select-none overflow-hidden`}>{children}
        <SpeedInsights />
      </body>
    </html>
  );
}
