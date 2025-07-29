import express from "express";
import Users from "../models/SignupSchema.js";
import { WelcomeEmail } from "../middleware/WelcomeEmail.js";
import { VerificationEmail } from "../middleware/VerificationEmail.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Verification route is working");
});

router.post("/", async (req, res) => {
  try {
    let { email } = req.body;
    let User = await Users.findOne({ email: email });
    // if (!User) {
    //   return res
    //     .status(400)
    //     .json({ success: false});
    // }
    // User.isVerified = true;
    const VerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    User.VerificationCode = VerificationCode;
    await User.save();
    VerificationEmail(email, VerificationCode);

    return res.status(200).json({
      success: true,
      message: "Verification Email sent successfully.",
    });
  } catch (error) {
    console.error("Error in verification route:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.post(
  "/postID",
  upload.fields([{ name: "front" }, { name: "back" }]),
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      const user = await Users.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (req.files.front) {
        user.StudentID.front = req.files.front[0].buffer;
      }

      if (req.files.back) {
        user.StudentID.back = req.files.back[0].buffer;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Student ID uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading Student ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

router.get("/getIDFront/:email", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.params.email });

    if (!user || !user.StudentID.front) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", "image/png"); // or jpeg, etc.
    res.send(user.StudentID.front);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/verfiyCode", async (req, res) => {
  try {
    let { code } = req.body;
    let User = await Users.findOne({ VerificationCode: code });
    if (!User) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Verification Code." });
    }
    User.isVerified = true;
    User.VerificationCode = null;
    await User.save();

    const UserName = User.firstName + " " + User.lastName;

    WelcomeEmail(User.email, UserName);
    return res.status(200).json({
      success: true,
      message: "Welcome Email sent successfully.",
    });
  } catch (error) {
    console.error("Error in verification route:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.post("/postContacts", async (req, res) => {
  try {
    let { email, contacts } = req.body;
    let User = await Users.findOne({ email: email });
    if (!User) {
      return res.status(400).json({
        success: false,
        message: "User with this email doesn't exists.",
      });
    }
    User.Emergency_Contacts = contacts;
    await User.save();

    return res.status(200).json({
      success: true,
      message: "Emergency Contacts Added Successfully.",
    });
  } catch (error) {
    console.error("Error posting contacts:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.post("/postRoutes", async (req, res) => {
  try {
    let { email, routes } = req.body;
    let User = await Users.findOne({ email: email });
    if (!User) {
      return res.status(400).json({
        success: false,
        message: "User with this email doesn't exists.",
      });
    }
    User.Routes = routes;
    await User.save();

    return res.status(200).json({
      success: true,
      message: "Routes Added Successfully.",
    });
  } catch (error) {
    console.error("Error posting routes:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

export default router;
