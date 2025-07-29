// import express from "express";
// import signup from "./routes/signup.js";
// import Verification from "./routes/Verification.js";
// import dashboard from "./routes/dashboard.js";
// import login from "./routes/login.js";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import journey from "./routes/journeys.js";
// import message from "./routes/message.js";
// import notify from "./routes/notify.js";
// import { io, server, app } from "./Socket/server.js";

// dotenv.config();

// const port = process.env.PORT || 3000;

// app.use(cookieParser());
// app.use(express.json());
// app.use(cors());

// mongoose
//   .connect(`${process.env.MONGO_URL}/SafeJourney`)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err.message));

// app.use("/signup", signup);
// app.use("/login", login);
// app.use("/verification", Verification);
// app.use("/dashboard", dashboard);
// app.use("/journeys", journey);
// app.use("/message", message);
// app.use("/notify", notify);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// server.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";

// // Routes
// import signup from "./routes/signup.js";
// import login from "./routes/login.js";
// import dashboard from "./routes/dashboard.js";
// import message from "./routes/message.js";
// import verification from "./routes/Verification.js";
// import notify from "./routes/notify.js";
// import Users from "./models/SignupSchema.js";
// import journey from "./routes/journeys.js";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://safe-journey-frontend.vercel.app",
//     ],
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
// });

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://safe-journey-frontend.vercel.app",
//     ],
//     credentials: true,
//   })
// );

// app.use((req, res, next) => {
//   const allowedOrigins = [
//     "https://safe-journey-frontend.vercel.app",
//     "http://localhost:5173",
//   ];

//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }

//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   next();
// });

// app.use(cookieParser());
// app.use(express.json());

// // Routes
// app.use("/signup", signup);
// app.use("/login", login);
// app.use("/dashboard", dashboard);
// app.use("/message", message);
// app.use("/verification", verification);
// app.use("/notify", notify);
// app.use("/journeys", journey);

// app.get("/", (req, res) => res.send("Hello World!"));

// // ✅ MONGODB
// mongoose
//   .connect(`${process.env.MONGO_URL}/SafeJourney`)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err.message));

// // ✅ SOCKET.IO AUTH MIDDLEWARE
// let users = {};

// const getReceiverSocketId = (receiverId) => {
//   console.log("📡 Looking for receiver socket with ID:", receiverId);
//   console.log("📡 Full socket map:", users);
//   return users[receiverId] || null;
// };

// io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;
//   console.log("🛡️ Socket auth token:", token);

//   if (!token) return next(new Error("Unauthorized"));

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_Secret);
//     const user = await Users.findOne({ email: decoded.email });
//     if (!user) return next(new Error("User not found"));

//     users[user._id.toString()] = socket.id;
//     console.log("✅ Current users map:", users);
//     next();
//   } catch (err) {
//     console.log("❌ Authentication error:", err.message);
//     next(new Error("Invalid token"));
//   }
// });

// // ✅ SOCKET CONNECTION HANDLING
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

//   // io.emit("getOnlineUsers", Object.keys(users));
// });

// // ✅ START SERVER
// const port = process.env.PORT || 3000;
// server.listen(port, () => {
//   console.log(`🚀 Server + Socket.IO running on port ${port}`);
// });

// index.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import signup from "./routes/signup.js";
import login from "./routes/login.js";
import dashboard from "./routes/dashboard.js";
import message from "./routes/message.js";
import verification from "./routes/Verification.js";
import notify from "./routes/notify.js";
import journey from "./routes/journeys.js";
import feedback from "./routes/feedback.js";

// Socket.IO setup
import { initSocket } from "./Socket/server.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://safe-journey-frontend.vercel.app",
      "http://192.168.1.4:5173",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/signup", signup);
app.use("/login", login);
app.use("/dashboard", dashboard);
app.use("/message", message);
app.use("/verification", verification);
app.use("/notify", notify);
app.use("/journeys", journey);
app.use("/feedback", feedback);

app.get("/", (req, res) => res.send("✅ Safe Journey Backend Running"));

// DB Connection
mongoose
  .connect(`${process.env.MONGO_URL}/SafeJourney`)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// Socket.IO
initSocket(server);

// Start Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server + Socket.IO running on port ${port}`);
});
