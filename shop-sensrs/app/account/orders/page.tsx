"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders/my-orders", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success) {
          router.push("/auth/login?redirect=/account/orders");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("ACCOUNT ORDERS ERROR:", error);
        router.push("/auth/login?redirect=/account/orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return <p className="text-center text-slate-400 font-medium py-16">Loading orders...</p>;
  }

  return (
    <section className="bg-slate-50 min-h-screen px-4 py-8 md:px-12 flex justify-center font-sans text-black">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* HEADER AREA */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">My Orders</h1>
          <p className="text-sm text-slate-500 font-medium">Track your recent purchases and order details.</p>
        </div>

        {orders.length === 0 ? (
          /* EMPTY FALLBACK CONTAINER */
          <div className="flex flex-col items-center text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-2xl mb-4">📦</div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No orders yet</h3>
            <p className="text-xs text-slate-400 max-w-[280px] mb-6 font-medium">You have not placed any orders yet.</p>
            <Link 
              href="/products" 
              className="rounded-xl bg-[#e11d48] hover:bg-[#c2143a] text-white px-6 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* ORDERS GRID LIST STACK */
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div 
                className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)]" 
                key={order._id}
              >
                {/* HEADER ELEMENT CONTEXT BAR */}
                <div className="flex justify-between items-start w-full border-b border-slate-100 pb-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-serif text-2xl font-normal text-[#00241b] m-0">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* PILL STATUS CONTROLLERS MAP */}
                  <span
                    className={`rounded px-3 py-1 text-[10px] font-bold tracking-wide uppercase border ${
                      order.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : order.status === "shipped"
                        ? "bg-sky-50 text-sky-700 border-sky-100"
                        : order.status === "confirmed"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : order.status === "cancelled"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                </div>

                {/* PROFILE INFORMATION SUBGRID AREA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-sm text-slate-600 border-b border-slate-100 pb-5">
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Name:</strong> {order.fullName}</p>
                  <p className="leading-relaxed break-all"><strong className="text-slate-800 font-semibold">Email:</strong> {order.email}</p>
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Phone:</strong> {order.phone}</p>
                  <p className="leading-relaxed text-[#b89047] font-semibold">
                    <strong className="text-slate-800 font-semibold">Total:</strong> ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="leading-relaxed sm:col-span-2 md:col-span-4 mt-1">
                    <strong className="text-slate-800 font-semibold">Address:</strong> {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                  </p>
                </div>

                {/* ITEMIZATION PURCHASE STACK COMPONENT */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Items</h3>
                  <div className="flex flex-col gap-2.5">
                    {order.items?.map((item, index) => (
                      <div className="flex justify-between items-center bg-[#f8fafc] border border-slate-100/60 rounded-xl px-5 py-3 text-sm" key={index}>
                        <span className="text-slate-700 font-medium">
                          {item.title} <span className="text-xs text-slate-400 font-bold ml-1">× {item.quantity}</span>
                        </span>
                        <span className="text-slate-900 font-semibold shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}