import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
