import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Providers } from "@/components/providers/session-provider";
import { ToasterClient } from "@/components/ui/toaster-client";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Flag Feature assignment",
  description: "A project to manage feature flags",
  generator: "divyanshu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        <ToasterClient />
        <Analytics />
      </body>
    </html>
  );
}
