import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./context/sessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estudiantil-App",
  description: "La mejor plataforma educativa online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-black {inter.className} ">
        <SessionWrapper>
        {children}
        </SessionWrapper>
        </body>
    </html>
  );
}
