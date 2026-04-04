"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { products as initialProducts, Product } from "@/lib/products";

type ProductInput = Omit<Product, "id">;

type ProductContextType = {
  products: Product[];
  featuredProducts: Product[];
  addProduct: (product: ProductInput) => void;
  updateProduct: (id: number, updatedProduct: ProductInput) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem("shop-sensrs-products");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("shop-sensrs-products", JSON.stringify(products));
    }
  }, [products, loaded]);

  const addProduct = (product: ProductInput) => {
    setProducts((prev) => {
      const nextId =
        prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1;

      return [...prev, { id: nextId, ...product }];
    });
  };

  const updateProduct = (id: number, updatedProduct: ProductInput) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, id, ...updatedProduct } : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const getProductById = (id: number) => {
    return products.find((product) => product.id === id);
  };

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductProvider");
  }

  return context;
}