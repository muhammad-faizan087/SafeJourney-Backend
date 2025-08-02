import express from "express";
import Message from "../models/MessageModel.js";
import Conversation from "../models/ConversationSchema.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Users from "../models/SignupSchema.js";
import { io, getReceiverSocketId } from "../Socket/server.js";
// import { io } from "../Socket/server.js";

const router = express.Router();

// router.post("/sendMessage/", async (req, res) => {
//   const { message, receiverId, senderEmail } = req.body;
//   // const currUser = req.user;

//   if (!receiverId || !message || !senderEmail) {
//     return res.status(400).json({
//       success: false,
//       message: "Receiver and message are required",
//     });
//   }

//   try {
//     const sender = await Users.findOne({ email: senderEmail });
//     const receiver = await Users.findById(receiverId);

//     if (!sender || !receiver) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const newMessage = new Message({
//       senderId: sender._id,
//       receiverId,
//       message,
//     });

//     let conversation = await Conversation.findOne({
//       participants: { $all: [sender._id, receiverId] },
//     });

//     if (!conversation) {
//       conversation = new Conversation({
//         participants: [sender._id, receiverId],
//         messages: [newMessage._id],
//         receiverName: `${receiver.firstName} ${receiver.lastName}`,
//         senderName: `${sender.firstName} ${sender.lastName}`,
//         lastMessage: message,
//       });
//     } else {
//       conversation.messages.push(newMessage._id);
//       conversation.lastMessage = message;
//     }

//     await newMessage.save();
//     await conversation.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);

//     const senderSocketId = getReceiverSocketId(sender._id);

//     // Emit to receiver (if online)
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", {
//         message: newMessage,
//         conversationId: conversation._id,
//         senderName: `${sender.firstName} ${sender.lastName}`,
//         receiverName: `${receiver.firstName} ${receiver.lastName}`,
//         type: "Received",
//         receiverId,
//       });
//     }

//     // Emit to sender (if online)
//     if (senderSocketId) {
//       io.to(senderSocketId).emit("newMessage", {
//         message: newMessage,
//         conversationId: conversation._id,
//         senderName: `${sender.firstName} ${sender.lastName}`,
//         receiverName: `${receiver.firstName} ${receiver.lastName}`,
//         type: "Sent",
//         receiverId,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Message sent successfully",
//       newMessage,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// });

router.post("/sendMessage/", async (req, res) => {
  try {
    const { message, receiverId, senderEmail } = req.body;

    if (!receiverId || !message || !senderEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // Use Promise.all to fetch users in parallel
    const [sender, receiver] = await Promise.all([
      Users.findOne({ email: senderEmail }).lean(),
      Users.findById(receiverId).lean(),
    ]);

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newMessage = new Message({
      senderId: sender._id,
      receiverId,
      message,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [sender._id, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender._id, receiverId],
        messages: [newMessage._id],
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        senderName: `${sender.firstName} ${sender.lastName}`,
        lastMessage: message,
        lastMessageTime: message.createdAt,
      });
    } else {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = message;
      conversation.lastMessageTime = message.createdAt;
    }

    // Save all at once
    await Promise.all([newMessage.save(), conversation.save()]);

    // Emit to receiver only
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Emitting to socket ID:", receiverSocketId);

    if (receiverSocketId) {
      // const FullTime = new Date();
      // const message = `You've received a new message from ${
      //   sender.firstName + sender.lastName
      // }`;
      // const notification = { message, FullTime };
      // receiver.Notifications.push(notification);
      io.to(receiverSocketId).emit("newMessage", {
        message: newMessage,
        conversationId: conversation._id,
        senderName: `${sender.firstName} ${sender.lastName}`,
        receiverName: `${receiver.firstName} ${receiver.lastName}`,
        type: "Received",
        receiverId,
        // notification,
      });
      // await receiver.save();
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/getMessages/:id", authMiddleware, async (req, res) => {
  const currUser = req.user;
  const senderId = await Users.findOne({ email: currUser.email }).then(
    (user) => user._id
  );
  const chatUser = req.params.id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, chatUser] },
    }).populate("messages");
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        messages: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Conversation found",
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/getConversations", authMiddleware, async (req, res) => {
  const currUser = req.user;
  const userId = await Users.findOne({ email: currUser.email }).then(
    (user) => user._id
  );
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("messages");
    if (!conversations || conversations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No conversations found",
        conversations: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.post("/createConversation", async (req, res) => {
  const {
    receiverId,
    receiverName,
    senderName,
    origin,
    destination,
    senderEmail,
  } = req.body;
  // const currUser = req.user;
  const senderId = await Users.findOne({ email: senderEmail }).then(
    (user) => user._id
  );
  const receiverEmail = await Users.findOne({ _id: receiverId }).then(
    (user) => user.email
  );
  if (
    !senderId ||
    !receiverId ||
    !receiverName ||
    !senderName ||
    !origin ||
    !destination ||
    !receiverEmail ||
    !senderEmail
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
      senderId,
      receiverId,
      receiverName,
      senderName,
      origin,
      destination,
      receiverEmail,
      senderEmail: senderEmail,
    });
  }
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
        receiverName,
        senderName,
        // lastMessage: "",
        origin,
        destination,
        receiverEmail,
        senderEmail: senderEmail,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
export default router;
