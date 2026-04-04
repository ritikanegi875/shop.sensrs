import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    id: Number,
    title: String,
    price: Number,
    image: String,
    quantity: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      default: "BUY_NOW",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = models.Order || model("Order", OrderSchema);

export default Order;