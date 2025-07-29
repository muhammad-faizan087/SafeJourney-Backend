import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
import Users from "../models/SignupSchema.js";
import Feedback from "../models/FeedbackModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  //   const UserEmail = req.user.email;
  const { UserName, UserEmail, ratings, comment } = req.body;

  try {
    // const User = await Users.findOne({ email: UserEmail });

    // if (!User) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User Not Found",
    //   });
    // }

    const feedback = new Feedback({ UserName, ratings, comment });
    await feedback.save();

    return res.status(200).json({
      success: true,
      message: "Feedback Added Successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/getAllFeedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}); // 🔧 await added

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Feedback Found",
        feedbacks: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedbacks Found",
      feedbacks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      feedbacks: [],
    });
  }
});

export default router;
