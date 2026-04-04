import {
  AppointmentEmailPayload,
  BuyNowEmailPayload,
} from "@/lib/email-types";

export function getBuyNowUserEmail(payload: BuyNowEmailPayload) {
  return {
    subject: `Order Confirmation - ${payload.code}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Hello ${payload.fullName},</p>
      <p>Your order has been received successfully.</p>
      <p><strong>Reference Code:</strong> ${payload.code}</p>
      <p><strong>Total:</strong> ₹${payload.totalPrice.toLocaleString("en-IN")}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Address:</strong> ${payload.address}, ${payload.city}, ${payload.state} - ${payload.pincode}</p>
      <p><strong>Notes:</strong> ${payload.notes || "—"}</p>
      <h3>Items</h3>
      <ul>
        ${payload.items
          .map(
            (item) =>
              `<li>${item.title} × ${item.quantity} — ₹${(
                item.price * item.quantity
              ).toLocaleString("en-IN")}</li>`
          )
          .join("")}
      </ul>
      <p>Thank you for shopping with Shop.SEnSRS.</p>
    `,
  };
}

export function getBuyNowAdminEmail(payload: BuyNowEmailPayload) {
  return {
    subject: `New Buy Now Order - ${payload.code}`,
    html: `
      <h2>New Order Received</h2>
      <p><strong>Code:</strong> ${payload.code}</p>
      <p><strong>Name:</strong> ${payload.fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Address:</strong> ${payload.address}, ${payload.city}, ${payload.state} - ${payload.pincode}</p>
      <p><strong>Total:</strong> ₹${payload.totalPrice.toLocaleString("en-IN")}</p>
      <p><strong>Notes:</strong> ${payload.notes || "—"}</p>
      <h3>Items</h3>
      <ul>
        ${payload.items
          .map(
            (item) =>
              `<li>${item.title} × ${item.quantity} — ₹${(
                item.price * item.quantity
              ).toLocaleString("en-IN")}</li>`
          )
          .join("")}
      </ul>
    `,
  };
}

export function getAppointmentUserEmail(payload: AppointmentEmailPayload) {
  return {
    subject: `Appointment Confirmation - ${payload.code}`,
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Hello ${payload.fullName},</p>
      <p>Your appointment has been booked successfully.</p>
      <p><strong>Reference Code:</strong> ${payload.code}</p>
      <p><strong>Date:</strong> ${payload.date}</p>
      <p><strong>Time Slot:</strong> ${payload.timeSlot}</p>
      <p><strong>Purpose:</strong> ${payload.purpose}</p>
      <p><strong>Notes:</strong> ${payload.notes || "—"}</p>
      <p>Thank you for choosing Shop.SEnSRS.</p>
    `,
  };
}

export function getAppointmentAdminEmail(payload: AppointmentEmailPayload) {
  return {
    subject: `New Appointment Booked - ${payload.code}`,
    html: `
      <h2>New Appointment Booked</h2>
      <p><strong>Code:</strong> ${payload.code}</p>
      <p><strong>Name:</strong> ${payload.fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Date:</strong> ${payload.date}</p>
      <p><strong>Time Slot:</strong> ${payload.timeSlot}</p>
      <p><strong>Purpose:</strong> ${payload.purpose}</p>
      <p><strong>Notes:</strong> ${payload.notes || "—"}</p>
    `,
  };
}