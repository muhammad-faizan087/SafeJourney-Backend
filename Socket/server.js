// import { Server } from "socket.io";
// import http from "http";
// import express from "express";
// import Users from "../models/SignupSchema.js";
// import cors from "cors";
// import jwt from "jsonwebtoken";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://safe-journey-frontend.vercel.app",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // app.use(
// //   cors({
// //     origin: [
// //       "http://localhost:5173",
// //       "https://safe-journey-frontend.vercel.app",
// //     ],
// //     credentials: true,
// //   })
// // );

// console.log("⚡ Socket server is setting up...");

// let users = {};

// io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;
//   console.log("Socket auth token:", token);

//   if (!token) return next(new Error("Unauthorized"));

//   const decoded = jwt.verify(token, process.env.JWT_Secret);
//   const user = await Users.findOne({ email: decoded.email });
//   try {
//     if (!user) return next(new Error("User not found"));

//     users[user._id.toString()] = socket.id;
//     console.log("Current users map:", users);

//     next();
//   } catch (err) {
//     console.log("Authentication error:", err);
//     next(new Error("Invalid token"));
//   }
// });

// io.on("connection", async (socket) => {
//   console.log("✅ New socket connection:", socket.id);
//   const token = socket.handshake.auth.token;
//   console.log("Socket auth token:", token);

//   if (!token) return next(new Error("Unauthorized"));

//   const decoded = jwt.verify(token, process.env.JWT_Secret);
//   const user = await Users.findOne({ email: decoded.email });
//   console.log(`User connected: ${socket.id}`);
//   users[user._id.toString()] = socket.id;
//   console.log("Current users map:", users);

//   io.emit("getOnlineUsers", Object.keys(users));

//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//     delete users[user._id.toString()];
//     io.emit("getOnlineUsers", Object.keys(users));
//     console.log("Current users map:", users);
//   });
// });

// export const getReceiverSocketId = (receiverId) => {
//   console.log("📡 Looking for receiver socket with ID:", receiverId);
//   console.log("📡 Full socket map:", users);
//   return users[receiverId] || null;
// };

// export { io, server, app };

// Socket/server.js
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
        "https://safe-journey-frontend.vercel.app",
        "http://192.168.1.4:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("⚡ Socket.IO server initializing...");

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("🛡️ Socket auth token:", token);

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_Secret);
      const user = await Users.findOne({ email: decoded.email });

      if (!user) return next(new Error("User not found"));

      users[user._id.toString()] = socket.id;
      console.log("✅ Users map updated:", users);
      next();
    } catch (err) {
      console.log("❌ Auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("✅ New socket connected:", socket.id);

    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    const user = await Users.findOne({ email: decoded.email });

    if (user) {
      users[user._id.toString()] = socket.id;
      io.emit("getOnlineUsers", Object.keys(users));
    }

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
      for (const [userId, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[userId];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(users));
      console.log("📉 Updated users map:", users);
    });
  });
};

export const getReceiverSocketId = (receiverId) => {
  console.log("📡 Looking for socket ID of receiver:", receiverId);
  return users[receiverId] || null;
};

export { io };
