import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    vehicleType: {
      type: String,
      enum: ["Bike", "Car", "Mini", "Premium"],
      required: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
    },

    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);

