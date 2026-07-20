import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Painel administrativo | Corta Essa!",
  description: "Gestão de estoque e destaques do cardápio Corta Essa!",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

