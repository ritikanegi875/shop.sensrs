import Link from "next/link";

export default function CheckoutPage() {
  return (
    <section className="checkout-choice-page">
      <div className="checkout-choice-header">
        <h1>Choose an Option</h1>
        <p>Select how you want to continue.</p>
      </div>

      <div className="checkout-choice-grid">
        <div className="checkout-choice-card">
          <h2>Buy Now</h2>
          <p>
            Place your order by filling out the required delivery and contact
            details.
          </p>
          <Link href="/checkout/buy-now">
            <button className="primary-btn">Continue with Buy Now</button>
          </Link>
        </div>

        <div className="checkout-choice-card">
          <h2>Book an Appointment</h2>
          <p>
            Schedule a meeting by selecting a date and an available 20-minute
            time slot.
          </p>
          <Link href="/checkout/book-appointment">
            <button className="primary-btn">Continue with Appointment</button>
          </Link>
        </div>
      </div>
    </section>
  );
}