import express from "express";
import Users from "../models/SignupSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const User = await Users.findOne({ email: data.email });

    if (!User) {
      return res.status(400).json({
        success: false,
        message: "No User found for this email.",
      });
    }

    if (!User.isVerified) {
      return res.status(400).json({
        success: false,
        message: "You are not a verified user.",
      });
    }

    const result = await bcrypt.compare(data.password, User.password);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }

    var token = jwt.sign({ email: User.email }, process.env.JWT_Secret);

    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      message: "Login Successful.",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
