import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SONIC FEST — The Ultimate Music Experience",
    template: "%s | SONIC FEST",
  },
  description:
    "Experience the world's most electrifying music festival featuring world-class headliners, groundbreaking stage visual architectures, and unforgettable memories.",
  keywords: [
    "music festival",
    "electronic music",
    "live concerts",
    "sonic fest",
    "music experience",
    "festival tickets",
  ],
  authors: [{ name: "Sonic Fest Production" }],
  openGraph: {
    title: "SONIC FEST — The Ultimate Music Experience",
    description: "Feel the beat. Live the vibe. Secure your official pass now.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
