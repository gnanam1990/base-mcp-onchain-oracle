import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnchainOracle",
  description: "x402-monetized Base analytics for agents and builders.",
  other: {
    "talentapp:project_verification":
      "6b596c16fe74c683a0c8890fe04b753c8f817fd3af2255cc7d2dbaff7008ed8178c8721ad3643f28edccaafd9f04a883fb8d6965e323f7aa7012ab71d6ddb0a7",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
