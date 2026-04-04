export type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 1,
    title: "Wireless Headphones",
    price: 2999,
    image: "/images/p1.jpg",
    category: "Audio",
    description: "Premium wireless headphones with rich sound quality.",
  },
  {
    id: 2,
    title: "Smart Watch",
    price: 4999,
    image: "/images/p2.jpg",
    category: "Wearables",
    description: "Smart watch with fitness tracking and notifications.",
  },
  {
    id: 3,
    title: "Bluetooth Speaker",
    price: 1499,
    image: "/images/p3.jpg",
    category: "Audio",
    description: "Portable speaker with deep bass and clear sound.",
  },
  {
    id: 4,
    title: "Gaming Mouse",
    price: 799,
    image: "/images/p4.jpg",
    category: "Accessories",
    description: "Ergonomic gaming mouse with precise tracking.",
  },
];

export const featuredProducts = products.slice(0, 4);