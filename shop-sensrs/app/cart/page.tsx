"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
  } = useCart();

  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section className="cart-page">
      <h1>My Cart</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item, index) => (
              <div
                className="cart-item"
                key={`${item.id}-${index}-${JSON.stringify(
                  item.selectedCustomizations || {}
                )}`}
              >
                <div className="cart-item-image">
                  <img
                    src={item.image}
                    alt={item.title}
                    width={120}
                    height={120}
                  />
                </div>

                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p>₹{item.price.toLocaleString("en-IN")}</p>

                  {item.selectedCustomizations &&
                    Object.keys(item.selectedCustomizations).length > 0 && (
                      <div className="selected-config cart-config">
                        <h4>Selected Configuration</h4>
                        <ul>
                          {Object.entries(item.selectedCustomizations).map(
                            ([key, value]) => (
                              <li key={key}>
                                {key}: {value}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <div className="cart-controls">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQty(item.id, item.selectedCustomizations)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        increaseQty(item.id, item.selectedCustomizations)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(item.id, item.selectedCustomizations)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₹{total.toLocaleString("en-IN")}</h2>

            <button
              type="button"
              className="checkout-btn"
              onClick={() => router.push("/checkout/buy-now")}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </section>
  );
}