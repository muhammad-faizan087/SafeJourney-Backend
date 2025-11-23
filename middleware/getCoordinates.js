import dotenv from "dotenv";
dotenv.config();

export async function getCoordinates(address) {
  const cleanedAddress = removeDuplicateWords(address);

  // Try original address
  let coords = await tryGetCoordinates(address);
  if (coords) return coords;

  // Try cleaned address if original fails
  if (cleanedAddress !== address) {
    console.warn("Retrying with cleaned address:", cleanedAddress);
    coords = await tryGetCoordinates(cleanedAddress);
    if (coords) {
      console.log(
        "Found coordinates after cleaning duplicates for:",
        cleanedAddress
      );
      return coords;
    }
  }

  console.error("Address not found after all attempts:", address);
  return null;
}

async function tryGetCoordinates(address) {
  // ---- Try Nominatim first ----
  const nominatimCoords = await fetchNominatim(address);
  if (nominatimCoords) return nominatimCoords;

  // ---- Fallback to OpenCage ----
  const openCageCoords = await fetchOpenCage(address);
  if (openCageCoords) {
    console.log("Coordinates received via OpenCage for:", address);
    return openCageCoords;
  }

  return null;
}

async function fetchNominatim(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SafeJourney/1.0 (contact@example.com)", // Replace with your contact
      },
    });

    if (!response.ok) throw new Error(`Nominatim failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (err) {
    console.error("Nominatim Error:", err.message);
    return null;
  }
}

async function fetchOpenCage(address) {
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) throw new Error("OpenCage API key not set in .env");

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${apiKey}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`OpenCage failed: ${response.status}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;

    return {
      lat: data.results[0].geometry.lat,
      lng: data.results[0].geometry.lng,
    };
  } catch (err) {
    console.error("OpenCage Error:", err.message);
    return null;
  }
}

// Utility: remove consecutive duplicate words (case-insensitive)
function removeDuplicateWords(str) {
  return str
    .split(/\s+/)
    .filter(
      (word, idx, arr) =>
        idx === 0 || word.toLowerCase() !== arr[idx - 1].toLowerCase()
    )
    .join(" ")
    .replace(/\s*,\s*/g, ", ") // normalize commas
    .trim();
}
