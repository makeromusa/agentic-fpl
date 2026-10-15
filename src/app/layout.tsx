import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic FPL Manager | AI Strategy Platform",
  description: "Next-gen Fantasy Premier League manager with game-theory mini-league optimization, live pitch analysis, and price predictor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0e0013] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
