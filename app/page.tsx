import { MenuClient } from "@/app/menu-client";
import { getCatalogInventory } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const inventory = await getCatalogInventory();
  return <MenuClient initialInventory={inventory} />;
}
