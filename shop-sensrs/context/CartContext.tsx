"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type SelectedCustomizations = Record<string, string>;

type CartItem = {
  id: string | number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedCustomizations?: SelectedCustomizations;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string | number, selectedCustomizations?: SelectedCustomizations) => void;
  increaseQty: (id: string | number, selectedCustomizations?: SelectedCustomizations) => void;
  decreaseQty: (id: string | number, selectedCustomizations?: SelectedCustomizations) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function isSameCustomization(
  a?: SelectedCustomizations,
  b?: SelectedCustomizations
) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {});
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("shop-sensrs-cart");

    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("shop-sensrs-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          isSameCustomization(
            cartItem.selectedCustomizations,
            item.selectedCustomizations
          )
      );

      if (existingIndex !== -1) {
        return prev.map((cartItem, index) =>
          index === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (
    id: string | number,
    selectedCustomizations?: SelectedCustomizations
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            isSameCustomization(item.selectedCustomizations, selectedCustomizations)
          )
      )
    );
  };

  const increaseQty = (
    id: string | number,
    selectedCustomizations?: SelectedCustomizations
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        isSameCustomization(item.selectedCustomizations, selectedCustomizations)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (
    id: string | number,
    selectedCustomizations?: SelectedCustomizations
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          isSameCustomization(item.selectedCustomizations, selectedCustomizations)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("shop-sensrs-cart");
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}