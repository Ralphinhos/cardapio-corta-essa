export type Category = "kit" | "unit";

export type Product = {
  slug: string;
  name: string;
  description: string;
  detail?: string;
  weight: string;
  price: number;
  tone: "green" | "orange";
};

export type CartItem = {
  product: Product;
  category: Category;
  quantity: number;
};

export const kits: Product[] = [
  {
    slug: "divine",
    name: "Divine Flour",
    description: "Farofa de milho com soja, castanha de caju e alho frito",
    weight: "2 unidades de 150 g",
    price: 35,
    tone: "green",
  },
  {
    slug: "gold",
    name: "Gold Marinade",
    description:
      "Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa",
    detail: "Marinada: shoyu, limão e gergelim tostado",
    weight: "270 g",
    price: 42,
    tone: "orange",
  },
  {
    slug: "red",
    name: "Red Hot Marinade",
    description:
      "Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa",
    detail: "Marinada: shoyu, pimenta-calabresa, cebola e pimentão",
    weight: "270 g",
    price: 42,
    tone: "green",
  },
  {
    slug: "persian",
    name: "Persian Barbecue",
    description: "Kafta de soja com recheio de provolone",
    weight: "300 g",
    price: 42,
    tone: "orange",
  },
  {
    slug: "turkish",
    name: "Turkish Skewer",
    description: "Kafta de soja com recheio de queijo coalho",
    weight: "300 g",
    price: 42,
    tone: "green",
  },
  {
    slug: "tropical",
    name: "Tropical Flavor",
    description:
      "Espetinho de tofu cremoso com abacaxi, cebola-roxa e pimentão",
    weight: "360 g",
    price: 42,
    tone: "orange",
  },
  {
    slug: "creamy",
    name: "Creamy Orange",
    description:
      "Medalhão de cenoura com recheio de mandioca e queijo coalho",
    weight: "380 g",
    price: 42,
    tone: "green",
  },
  {
    slug: "petite",
    name: "Petite Zucchini",
    description: "Medalhão de abobrinha com recheio de mandioca e provolone",
    weight: "380 g",
    price: 42,
    tone: "orange",
  },
  {
    slug: "deep",
    name: "Deep Purple",
    description:
      "Medalhão de repolho-roxo com recheio de cabotiá confitada, alho, gorgonzola e gergelim",
    weight: "360 g",
    price: 48,
    tone: "green",
  },
];

export const units: Product[] = [
  {
    slug: "divine",
    name: "Divine Flour",
    description: "Farofa de milho com soja, castanha de caju e alho frito",
    weight: "150 g",
    price: 18,
    tone: "green",
  },
  {
    slug: "gold",
    name: "Gold Marinade",
    description:
      "Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa",
    detail: "Marinada: shoyu, limão e gergelim tostado",
    weight: "90 g",
    price: 15,
    tone: "orange",
  },
  {
    slug: "red",
    name: "Red Hot Marinade",
    description:
      "Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa",
    detail: "Marinada: shoyu, pimenta-calabresa, cebola e pimentão",
    weight: "90 g",
    price: 15,
    tone: "green",
  },
  {
    slug: "persian",
    name: "Persian Barbecue",
    description: "Kafta de soja com recheio de queijo provolone",
    weight: "100 g",
    price: 15,
    tone: "orange",
  },
  {
    slug: "turkish",
    name: "Turkish Skewer",
    description: "Kafta de lentilha com recheio de queijo coalho",
    weight: "100 g",
    price: 15,
    tone: "green",
  },
  {
    slug: "tropical",
    name: "Tropical Flavor",
    description:
      "Espetinho de tofu cremoso com abacaxi, cebola-roxa e pimentão",
    weight: "100 g",
    price: 15,
    tone: "orange",
  },
  {
    slug: "creamy",
    name: "Creamy Orange",
    description:
      "Medalhão de cenoura com recheio de mandioca e queijo coalho",
    weight: "130 g",
    price: 15,
    tone: "green",
  },
  {
    slug: "petite",
    name: "Petite Zucchini",
    description: "Medalhão de abobrinha com recheio de mandioca e provolone",
    weight: "130 g",
    price: 15,
    tone: "orange",
  },
  {
    slug: "deep",
    name: "Deep Purple",
    description:
      "Medalhão de repolho-roxo com recheio de cabotiá confitada, alho, gorgonzola e gergelim",
    weight: "120 g",
    price: 18,
    tone: "green",
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(price);

export const productKey = (category: Category, product: Product) =>
  `${category}-${product.slug}`;

export const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5535910222015";

export const whatsappUrl = (product?: Product) => {
  const message = product
    ? `Olá! Gostaria de encomendar ${product.name} (${product.weight}).`
    : "Olá! Gostaria de fazer uma encomenda do cardápio Corta Essa.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

