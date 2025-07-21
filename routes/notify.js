import express from "express";
import { NotifyEmail } from "../middleware/NotifyEmail.js";
import Users from "../models/SignupSchema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    const response = await NotifyEmail(email);
    return res.status(200).json({
      success: true,
      message: "Notified Successfully",
      result: response,
    });
  } catch (error) {
    console.log("Error Notifying.");
    return res.status(500).json({
      success: false,
      message: "Error Notifying.",
    });
  }
});

router.post("/sendNotification", async (req, res) => {
  try {
    const { email, Notification } = req.body;
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found.",
      });
    }
    user.Notifications.push(Notification);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Notification added succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding notification.",
    });
  }
});

export default router;
