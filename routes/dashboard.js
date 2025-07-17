import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Users from "../models/SignupSchema.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const UserEmail = req.user.email;

  try {
    const User = await Users.findOne({ email: UserEmail });

    if (!User) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      firstName: User.firstName,
      lastName: User.lastName,
      routes: User.Routes,
      contacts: User.Emergency_Contacts,
      email: User.email,
      id: User._id,
      message: "User Data found.",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
