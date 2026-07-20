import { MenuClient } from "@/app/menu-client";
import { getCatalogProducts } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getCatalogProducts();
  return <MenuClient initialProducts={products} />;
}
