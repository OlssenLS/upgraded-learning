import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Slideshow",
  description: "Present your PDFs like a modern slideshow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${inter.className} h-full overflow-hidden bg-transparent antialiased`}>
        {children}
      </body>
    </html>
  );
}
