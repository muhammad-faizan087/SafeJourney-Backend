// export async function getCoordinates(address) {
//   const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//     address
//   )}&format=json&limit=1`;

//   const response = await fetch(url, {
//     headers: {
//       "User-Agent": "SafeJourney/1.0 (contact@example.com)", // replace with your real contact
//     },
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Nominatim Error:", response.status, errorText);
//     throw new Error("Failed to fetch coordinates from Nominatim.");
//   }

//   const data = await response.json();

//   if (!Array.isArray(data) || data.length === 0) {
//     console.warn("Address not found:", address);
//     return null;
//   }

//   return {
//     lat: parseFloat(data[0].lat),
//     lng: parseFloat(data[0].lon),
//   };
// }

import dotenv from "dotenv";
dotenv.config();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCoordinates(address) {
  // 1️⃣ Try Nominatim first
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  try {
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "SafeJourney/1.0 (contact@example.com)",
      },
    });

    if (!nominatimResponse.ok) {
      const errorText = await nominatimResponse.text();
      console.error("Nominatim Error:", nominatimResponse.status, errorText);
    } else {
      const nominatimData = await nominatimResponse.json();
      if (Array.isArray(nominatimData) && nominatimData.length > 0) {
        console.log("✅ Coordinates from Nominatim");
        return {
          lat: parseFloat(nominatimData[0].lat),
          lng: parseFloat(nominatimData[0].lon),
        };
      }
    }
  } catch (err) {
    console.error("Nominatim fetch error:", err.message);
  }

  // 2️⃣ Fallback to OpenCage (with delay to respect rate limit)
  const openCageKey = process.env.OPENCAGE_API_KEY;
  if (!openCageKey) {
    throw new Error("Missing OpenCage API key in .env");
  }

  console.log("⏳ Waiting before OpenCage request to respect rate limit...");
  await delay(1100); // 1.1 seconds delay to be safe

  const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${openCageKey}&limit=1`;

  try {
    const openCageResponse = await fetch(openCageUrl);
    if (!openCageResponse.ok) {
      const errorText = await openCageResponse.text();
      console.error("OpenCage Error:", openCageResponse.status, errorText);
      throw new Error("Failed to fetch coordinates from OpenCage.");
    }

    const openCageData = await openCageResponse.json();
    if (
      openCageData &&
      openCageData.results &&
      openCageData.results.length > 0
    ) {
      console.log("🌍 Coordinates from OpenCage");
      return {
        lat: openCageData.results[0].geometry.lat,
        lng: openCageData.results[0].geometry.lng,
      };
    } else {
      console.warn(
        "Address not found in both Nominatim and OpenCage:",
        address
      );
      return null;
    }
  } catch (err) {
    console.error("OpenCage fetch error:", err.message);
    return null;
  }
}
