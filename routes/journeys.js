import express from "express";
import { getCoordinates } from "../middleware/getCoordinates.js";
import Journey from "../models/journeySchema.js";
import Users from "../models/SignupSchema.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/createJourneyAndGetCompanions", async (req, res) => {
  const { email, fromAddress, toAddress, date, time, status } = req.body;

  try {
    const journeyTime = new Date(`${date}T${time}:00`);
    const fromCoords = await getCoordinates(fromAddress);
    const toCoords = await getCoordinates(toAddress);

    if (!fromCoords || !toCoords) {
      return res.status(400).json({
        success: false,
        message: "Could not determine coordinates for addresses.",
        companions: [],
      });
    }

    const alreadyExists = await Journey.findOne({
      email,
      "from.address": fromAddress,
      "to.address": toAddress,
      date,
      time: journeyTime,
    });

    if (!alreadyExists) {
      const journeyData = {
        email,
        from: {
          address: fromAddress,
          location: {
            type: "Point",
            coordinates: [fromCoords.lng, fromCoords.lat],
          },
        },
        to: {
          address: toAddress,
          location: {
            type: "Point",
            coordinates: [toCoords.lng, toCoords.lat],
          },
        },
        date,
        time: journeyTime,
        status,
      };
      const journey = new Journey(journeyData);
      await journey.save();
    } else {
      console.log("Journey with this data already exists");
    }

    const lowerBound = new Date(journeyTime.getTime() - 5 * 60 * 1000);
    const upperBound = new Date(journeyTime.getTime() + 5 * 60 * 1000);

    const fromMatches = await Journey.find({
      email: { $ne: email },
      date,
      time: { $gte: lowerBound, $lte: upperBound },
      status: "active",
      "from.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [fromCoords.lng, fromCoords.lat],
          },
          $maxDistance: 2000,
        },
      },
    });

    if (fromMatches.length > 0) {
      const finalMatches = fromMatches.filter((j) => {
        const [lng, lat] = j.to.location.coordinates;
        return (
          getDistanceFromLatLonInKm(lat, lng, toCoords.lat, toCoords.lng) <= 1
        );
      });

      const companionEmails = finalMatches.map((match) => match.email);
      const userDetails = await Users.find({ email: { $in: companionEmails } });

      const combined = finalMatches.map((match) => {
        const user = userDetails.find((u) => u.email === match.email);
        return {
          journey: match,
          user: user || null,
        };
      });

      return res.status(200).json({
        success: true,
        // journey,
        companions: combined,
      });
    } else {
      return res.status(200).json({
        success: true,
        // journey,
        companions: [],
      });
    }
  } catch (error) {
    console.error("Combined error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Distance helper
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

router.delete("/deleteMatchedJourney", async (req, res) => {
  const { receiverEmail, senderEmail, origin, destination } = req.body;
  try {
    const journeys = await Journey.find({
      "from.address": { $regex: new RegExp(`^\\s*${origin.trim()}\\s*$`, "i") },
      "to.address": {
        $regex: new RegExp(`^\\s*${destination.trim()}\\s*$`, "i"),
      },
      email: { $in: [receiverEmail, senderEmail] },
    });
    if (journeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matched journeys found",
      });
    }

    const result = await Journey.deleteMany({
      "from.address": { $regex: new RegExp(`^\\s*${origin.trim()}\\s*$`, "i") },
      "to.address": {
        $regex: new RegExp(`^\\s*${destination.trim()}\\s*$`, "i"),
      },
      email: { $in: [receiverEmail, senderEmail] },
    });
    return res.status(200).json({
      success: true,
      message: "Matched journeys deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting matched journeys:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
