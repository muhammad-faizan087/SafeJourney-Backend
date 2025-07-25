import { Server } from "socket.io";
import http from "http";
import express from "express";
import Users from "../models/SignupSchema.js";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://safe-journey-frontend.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://safe-journey-frontend.vercel.app",
    ],
    credentials: true,
  })
);

let users = {};

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Socket auth token:", token);

  if (!token) return next(new Error("Unauthorized"));

  const decoded = jwt.verify(token, process.env.JWT_Secret);
  const user = await Users.findOne({ email: decoded.email });
  try {
    if (!user) return next(new Error("User not found"));

    users[user._id] = socket.id;
    console.log("Current users map:", users);

    next();
  } catch (err) {
    console.log("Authentication error:", err);
    next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;
  console.log("Socket auth token:", token);

  if (!token) return next(new Error("Unauthorized"));

  const decoded = jwt.verify(token, process.env.JWT_Secret);
  const user = await Users.findOne({ email: decoded.email });
  console.log(`User connected: ${socket.id}`);
  users[user._id] = socket.id;
  console.log("Current users map:", users);

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[user._id];
    io.emit("getOnlineUsers", Object.keys(users));
    console.log("Current users map:", users);
  });
});

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId] || null;
};

export { io, server, app };
