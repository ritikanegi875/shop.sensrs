import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    items: [
      {
        id: Number,
        title: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalPrice: { type: Number, required: true },

    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);