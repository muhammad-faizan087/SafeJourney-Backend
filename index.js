import express from "express";
import signup from "./routes/signup.js";
import Verification from "./routes/Verification.js";
import dashboard from "./routes/dashboard.js";
import login from "./routes/login.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import journey from "./routes/journeys.js";
import message from "./routes/message.js";
import notify from "./routes/notify.js";
import { io, server, app } from "./Socket/server.js";

dotenv.config();

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://safe-journey-frontend.vercel.app",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");

  next();
});

mongoose
  .connect(`${process.env.MONGO_URL}/SafeJourney`)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.use("/signup", signup);
app.use("/login", login);
app.use("/verification", Verification);
app.use("/dashboard", dashboard);
app.use("/journeys", journey);
app.use("/message", message);
app.use("/notify", notify);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
