import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

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
      "https://safejourneyapp.vercel.app",
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
