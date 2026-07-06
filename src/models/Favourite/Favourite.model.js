import mongoose from "mongoose";

const favoritePlaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      enum: ["Home", "Work", "Other"],
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FavoritePlace = mongoose.model(
  "FavoritePlace",
  favoritePlaceSchema
);

export const FavoritePlace = mongoose.model("FavoritePlace", favoritePlaceSchema);