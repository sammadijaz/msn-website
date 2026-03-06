import type { Metadata } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "MSN — Mad Sam Notation",
    template: "%s | MSN",
  },
  description:
    "The most token-efficient structured data format for AI and modern applications. MSN compiles directly to JSON with unlimited nesting depth.",
  keywords: [
    "MSN",
    "Mad Sam Notation",
    "data format",
    "JSON",
    "token efficient",
    "AI",
    "parser",
    "configuration",
  ],
  openGraph: {
    title: "MSN — Mad Sam Notation",
    description:
      "The most token-efficient structured data format for AI and modern applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
