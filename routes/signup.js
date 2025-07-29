import express from "express";
import Users from "../models/SignupSchema.js";
import bcrypt from "bcryptjs";
import { VerificationEmail } from "../middleware/VerificationEmail.js";

const router = express.Router();

// Middleware that logs the time
// router.use((req, res, next) => {
//   console.log("Time:", new Date().toISOString());
//   next();
// });

// router.use(cors());

router.get("/", async (req, res) => {
  res.send("signup route is working");
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender } = req.body;

    const userExists = await Users.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const User = new Users({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
    });

    await User.save();

    res.status(200).json({
      success: true,
      message: "Valid Email.",
    });
  } catch (err) {
    console.error("Error in signup route:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

export default router;
