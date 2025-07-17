import mongoose from "mongoose";
import Users from "./SignupSchema.js";
import Message from "./MessageModel.js";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: Users, required: true },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Message,
        default: [],
      },
    ],
    senderName: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
