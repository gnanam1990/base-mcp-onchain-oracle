import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnchainOracle",
  description: "x402-monetized Base analytics for agents and builders.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
