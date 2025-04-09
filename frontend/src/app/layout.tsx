import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Components/Providers";
import GeneralNavbar from "./Components/NavBar/GeneralNavbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leads Generator",
  description: "Plataforma para gestión de leads en redes sociales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Providers>
        <GeneralNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
