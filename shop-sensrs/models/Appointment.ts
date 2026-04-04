import mongoose, { Schema, model, models } from "mongoose";

const AppointmentSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      default: "BOOK_APPOINTMENT",
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
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

const Appointment =
  models.Appointment || model("Appointment", AppointmentSchema);

export default Appointment;