"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty } = useCart();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <section className="cart-page">
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-image">
                <Image src={item.image} alt={item.title} width={120} height={120} />
              </div>

              <div className="cart-item-info">
                <h3>{item.title}</h3>
                <p>₹{item.price.toLocaleString("en-IN")}</p>

                <div className="cart-controls">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <h2>Total: ₹{totalPrice.toLocaleString("en-IN")}</h2>
            <Link href="/checkout">
              <button className="checkout-btn">Proceed to Checkout</button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}