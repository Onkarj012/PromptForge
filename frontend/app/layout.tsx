import type { Metadata } from "next";
import {
  Libre_Caslon_Display,
  Public_Sans,
  Outfit,
  Fragment_Mono,
} from "next/font/google";
import "./globals.css";

// Editorial display serif (condensed feel achieved via tight tracking in CSS)
const serif = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const accent = Outfit({ subsets: ["latin"], variable: "--font-accent" });

const mono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PromptForge — Stop guessing your prompts. Engineer them.",
  description:
    "Generate optimized, tool-specific prompts for Cursor, Bolt, and Claude, then benchmark them across models with cost and quality scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${accent.variable} ${mono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
