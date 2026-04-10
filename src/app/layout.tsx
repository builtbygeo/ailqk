import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Ailyak | Outdoor Bulgaria 🚐🇧🇬",
  description: "Най-голямата платформа за диво къмпингуване и приключения в България.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="bg">
        <body className={`${outfit.variable} font-sans antialiased bg-gray-50`}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
