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

    res.setHeader("Access-Control-Allow-Credentials", "true");

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true, // set to false for localhost (during dev)
    //   sameSite: "None", // or 'Lax'/'Strict' based on needs
    // });

    return res.status(200).json({
      success: true,
      message: "Login Successful.",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/changePassword", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/debug-token", (req, res) => {
  res.json({ token: req.cookies.token || "No token in cookies" });
});

export default router;
