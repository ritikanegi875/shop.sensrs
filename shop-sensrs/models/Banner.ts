import mongoose, { Schema, model, models } from "mongoose";

const BannerSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = models.Banner || model("Banner", BannerSchema);

export default Banner;