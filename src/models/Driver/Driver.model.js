import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String, // URL
      default: "",
    },

    licenseNumber: {
      type: String,
      required: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      lat: Number,
      lng: Number,
    },

    rating: {
      type: Number,
      default: 5,
    },

    totalRides: {
      type: Number,
      default: 0,
    },

    earnings: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "pending",
    },

    deviceToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Driver = mongoose.model("Driver", driverSchema);

