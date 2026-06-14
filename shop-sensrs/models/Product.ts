import mongoose, { Schema, models, model } from "mongoose";

const CustomizationOptionSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    // NEW FIELDS: Generic specification slots mapped to dynamic row indicators
    spec1: {
      type: String,
      default: "",
      trim: true,
    },
    spec2: {
      type: String,
      default: "",
      trim: true,
    },
    spec3: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const CustomizationGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["single"], default: "single" },
    description: { type: String, default: "", trim: true }, // Ensure this line exists here
    specLabels: {
      label1: { type: String, default: "Spec 1", trim: true },
      label2: { type: String, default: "Spec 2", trim: true },
      label3: { type: String, default: "Spec 3", trim: true },
    },
    options: { type: [CustomizationOptionSchema], default: [] },
  },
  { _id: true }
);

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    hasCustomization: {
      type: Boolean,
      default: false,
    },
    customizations: {
      type: [CustomizationGroupSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;