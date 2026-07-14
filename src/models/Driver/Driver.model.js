import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const driverSchema = new mongoose.Schema(
  {
      userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
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
      default: "active",
    },

    deviceToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
driverSchema.plugin(aggregatePaginate)

export const Driver = mongoose.model("Driver", driverSchema);

