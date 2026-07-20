import type { Metadata } from "next";
import "@fontsource/anton/400.css";
import "@fontsource/bebas-neue/400.css";
import "@fontsource/josefin-sans/400.css";
import "@fontsource/josefin-sans/600.css";
import "@fontsource/josefin-sans/700.css";
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
      <body>{children}</body>
    </html>
  );
}
