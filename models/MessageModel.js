import mongoose from "mongoose";
import Users from "./SignupSchema.js";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Users,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Users,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 500;
        },
        message: "Message must be between 1 and 500 characters.",
      },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
