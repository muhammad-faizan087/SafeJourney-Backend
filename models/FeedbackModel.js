import mongoose from "mongoose";

const FeedbackModel = new mongoose.Schema(
  {
    UserName: { type: String, required: true },
    ratings: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackModel);

export default Feedback;
