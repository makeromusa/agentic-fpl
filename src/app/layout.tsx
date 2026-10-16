import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic FPL Intelligence Platform",
  description:
    "Game-theory & multi-agent tactical optimizer for Fantasy Premier League. AI-powered squad analysis, transfer planning, and rival intelligence.",
  keywords: [
    "FPL",
    "Fantasy Premier League",
    "AI",
    "analytics",
    "transfer planner",
    "squad optimizer",
  ],
  authors: [{ name: "Agentic FPL" }],
  robots: "noindex, nofollow",
  openGraph: {
    title: "Agentic FPL Intelligence Platform",
    description: "AI-powered FPL squad analysis & tactical optimizer",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Agentic FPL" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
