import type { Metadata } from "next";
import "./globals.css";
import 'katex/dist/katex.css' // `rehype-katex` does not import the CSS for you
import React from "react";
import SiteFooter from "@/components/SiteFooter";
import {SiteHeader} from "@/components/SiteHeader";

import {Merriweather} from "next/font/google";
import {NextFontWithVariable} from "next/dist/compiled/@next/font";
import {websiteConfigs} from "@/website.configs";

const merriweather: NextFontWithVariable = Merriweather({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-merriweather',
    display: 'swap',
});

export const metadata: Metadata = {
  title: websiteConfigs.title,
  description: websiteConfigs.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} antialiased font-serif`}
      >
      <SiteHeader />
        {children}
      <SiteFooter />
      </body>
    </html>
  );
}
