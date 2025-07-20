import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

const journeySchema = new mongoose.Schema({
  email: {
    type: String,
    ref: "Users",
    required: true,
  },

  from: {
    type: pointSchema,
    required: true,
  },

  to: {
    type: pointSchema,
    required: true,
  },

  date: { type: String, required: true },
  time: { type: Date, required: true }, // ISO Date
  status: {
    type: String,
    enum: ["active", "matched", "inactive"],
    default: "active",
  },
});

// Add geospatial indexes
journeySchema.index({ "from.location": "2dsphere" });
journeySchema.index({ "to.location": "2dsphere" });

const Journey = mongoose.model("Journey", journeySchema);

export default Journey;
