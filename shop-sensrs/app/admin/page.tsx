import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage products, banners, orders, appointments, and exports.</p>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Products</h2>
          <p>Add, edit, delete, and manage product listings.</p>
          <Link href="/admin/products">
            <button>Manage Products</button>
          </Link>
        </div>

        <div className="admin-card">
          <h2>Banners</h2>
          <p>Upload and update homepage banners.</p>
          <Link href="/admin/banners">
            <button>Manage Banners</button>
          </Link>
        </div>

        <div className="admin-card">
          <h2>Orders</h2>
          <p>View all Buy Now records submitted from the checkout flow.</p>
          <Link href="/admin/orders">
            <button>View Orders</button>
          </Link>
        </div>

        <div className="admin-card">
          <h2>Appointments</h2>
          <p>View all booked appointment records and selected time slots.</p>
          <Link href="/admin/appointments">
            <button>View Appointments</button>
          </Link>
        </div>

        <div className="admin-card admin-card-full">
          <h2>Export Records</h2>
          <p>
            Download the combined Excel file containing Buy Now and Appointment
            records.
          </p>
          <a href="/api/export">
            <button>Download Excel</button>
          </a>
        </div>
      </div>
    </section>
  );
}