"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

type Address = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  addresses?: Address[];
};

export default function BuyNowPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success || !data.user) {
          router.push("/auth/login?redirect=/checkout/buy-now");
          return;
        }

        const fetchedUser = data.user as ProfileUser;
        setUser(fetchedUser);
        setEmail(fetchedUser.email || "");

        if (fetchedUser.addresses && fetchedUser.addresses.length > 0) {
          const defaultAddress =
            fetchedUser.addresses.find((address) => address.isDefault) ||
            fetchedUser.addresses[0];

          setSelectedAddressId(defaultAddress._id);
          fillAddressFields(defaultAddress, fetchedUser.email);
        }
      } catch (error) {
        console.error("BUY NOW PROFILE ERROR:", error);
        router.push("/auth/login?redirect=/checkout/buy-now");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [router]);

  const fillAddressFields = (address: Address, fallbackEmail?: string) => {
    setFullName(address.fullName || "");
    setPhone(address.phone || "");
    setAddressLine(address.addressLine || "");
    setCity(address.city || "");
    setStateName(address.state || "");
    setPincode(address.pincode || "");
    if (fallbackEmail) setEmail(fallbackEmail);
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    const selected = user?.addresses?.find((a) => a._id === addressId);
    if (selected) {
      fillAddressFields(selected, user?.email || "");
    }
  };

  const handleOrder = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine ||
      !city ||
      !stateName ||
      !pincode
    ) {
      alert("Please fill all fields");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          addressLine,
          city,
          state: stateName,
          pincode,
          items: cartItems,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully!");
        clearCart();
        router.push("/account/orders");
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <p className="text-center text-slate-400 font-medium py-16">Loading checkout...</p>;
  }

  return (
    <section className="bg-white min-h-screen px-4 py-8 md:px-12 flex justify-center font-sans text-black">
      <div className="w-full max-w-[900px] border border-slate-400 rounded-[28px] p-6 md:p-10 bg-white">
        
        {/* CHECKOUT HEADER AREA */}
        <h1 className="text-4xl font-bold mb-1 tracking-tight">Checkout</h1>
        <p className="text-sm text-slate-700 mb-8 font-medium">
          Logged in as: <span className="text-slate-900">{email || user?.email || "User"}</span>
        </p>

        {cartItems.length === 0 ? (
          <p className="text-center text-slate-400 font-medium py-8">Your cart is empty.</p>
        ) : (
          <>
            {/* ================= ORDER SUMMARY COMPONENT CONTAINER ================= */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Order Summary</h2>
              
              <div className="border border-slate-300 rounded-2xl bg-[#f2f2f2]/60 p-5 md:p-6 flex flex-col gap-6">
                {cartItems.map((item, index) => (
                  <div 
                    key={`${item.id}-${index}`} 
                    className={`flex justify-between items-start text-sm ${
                      index !== 0 ? "border-t border-slate-300 pt-5" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-base font-bold text-slate-900">{item.title}</strong>
                      <p className="text-sm text-slate-600 font-medium">Qty: {item.quantity}</p>

                      {item.selectedCustomizations &&
                        Object.keys(item.selectedCustomizations).length > 0 && (
                          <ul className="mt-2 flex flex-col gap-1 text-xs font-semibold text-slate-600 list-disc pl-4 uppercase tracking-wide">
                            {Object.entries(item.selectedCustomizations).map(
                              ([key, value]) => (
                                <li key={key}>
                                  {key}: {value}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                    </div>

                    <span className="text-base font-semibold text-slate-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* ESTIMATED TOTAL LABEL METRIC */}
              <h3 className="text-2xl font-bold text-[#e11d48] mt-5 tracking-tight">
                Total: ₹{totalPrice.toLocaleString("en-IN")}
              </h3>
            </div>

            {/* ================= ADDRESS PICKER SLIDER BLOCK ================= */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Choose Saved Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => handleAddressSelect(address._id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-150 bg-white ${
                        selectedAddressId === address._id 
                          ? "border-[#e11d48] ring-1 ring-[#e11d48]" 
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <strong className="text-sm font-bold text-slate-900 mb-1">{address.label || "Address"}</strong>
                      <p className="text-xs text-slate-600 font-medium">{address.fullName}</p>
                      <p className="text-xs text-slate-600 font-medium">{address.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">{address.addressLine}</p>
                      <p className="text-xs text-slate-500">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= DELIVERY METADATA FORM INTERFACE ================= */}
            <div className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Address Line</label>
                <textarea
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House no, street, area, landmark"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter state"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-900">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* ACTION: PLACE ORDER TRIGGER */}
              <button
                type="button"
                onClick={handleOrder}
                disabled={loading}
                className="w-full rounded-xl bg-[#e11d48] hover:bg-[#c2143a] text-white py-3.5 text-center text-sm font-semibold tracking-wide transition-colors duration-150 disabled:bg-slate-300 mt-4 active:scale-[0.99]"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}