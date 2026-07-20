import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardápio | Corta Essa!",
  description:
    "Cardápio completo de produtos gourmet para churrasco vegetariano da Corta Essa!",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/images/logo-transparent.png",
    shortcut: "/images/logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/anton-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/josefin-sans-600.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/josefin-sans-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
