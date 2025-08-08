import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice | WeWire",
  description:
    "Create, preview, and download professional invoices for your business.",
  openGraph: {
    title: "Invoice | WeWire",
    description:
      "Create, preview, and download professional invoices for your business.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Invoice | WeWire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice | WeWire",
    description:
      "Create, preview, and download professional invoices for your business.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased print:bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
