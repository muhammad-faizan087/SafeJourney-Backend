import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Users from "../models/SignupSchema.js";

let io = null;
const users = {};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://safejourneyapp.vercel.app",
        "http://192.168.1.4:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("Socket.IO server initializing...");

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    // console.log("Socket auth token:", token);

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      const user = await Users.findOne({ email: decoded.email });

      if (!user) return next(new Error("User not found"));

      users[user._id.toString()] = socket.id;
      // console.log("Users map updated:", users);
      next();
    } catch (err) {
      console.log("Auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    // console.log("New socket connected:", socket.id);

    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    const user = await Users.findOne({ email: decoded.email });

    if (user) {
      users[user._id.toString()] = socket.id;
      io.emit("getOnlineUsers", Object.keys(users));
    }

    socket.on("disconnect", () => {
      // console.log("Disconnected:", socket.id);
      for (const [userId, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[userId];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(users));
      // console.log("Updated users map:", users);
    });
  });
};

export const getReceiverSocketId = (receiverId) => {
  // console.log("Looking for socket ID of receiver:", receiverId);
  return users[receiverId] || null;
};

export { io };
