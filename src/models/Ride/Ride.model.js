import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    driverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    pickupCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    destinationCoordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    distance: {
      type: Number, // KM
      required: true,
    },

    duration: {
      type: Number, // Minutes
      required: true,
    },

    fare: {
      type: Number,
      required: true,
    },

    rideType: {
      type: String,
      enum: ["Bike", "Car", "Mini", "Premium"],
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Wallet"],
      required: true,
    },

    rideStatus: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "arrived",
        "started",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    cancelledBy: {
    type: String,
    enum: ["user", "driver"],
    default: null
},

cancelReason: {
    type: String,
    default: ""
},

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rideSchema.plugin(aggregatePaginate)

export const Ride = mongoose.model("Ride", rideSchema);

