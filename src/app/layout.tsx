import type { Metadata } from "next";
import { Actor } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
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
      <body className={`${inter.className} select-none overflow-hidden`}>{children}
        <SpeedInsights />
      </body>
    </html>
  );
}
