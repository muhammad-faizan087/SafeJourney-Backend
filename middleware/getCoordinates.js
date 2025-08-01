// export async function getCoordinates(address) {
//   const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//     address
//   )}&format=json&limit=1`;

//   const response = await fetch(url, {
//     headers: {
//       "User-Agent": "YourAppName/1.0 (your@email.com)",
//     },
//   });

//   console.log(response);

//   const data = await response.json();

//   if (data.length === 0) {
//     // throw new Error();
//     console.log("Address not found");
//     return;
//   }

//   return {
//     lat: parseFloat(data[0].lat),
//     lng: parseFloat(data[0].lon),
//   };
// }

export async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SafeJourney/1.0 (contact@example.com)", // replace with your real contact
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Nominatim Error:", response.status, errorText);
    throw new Error("Failed to fetch coordinates from Nominatim.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    console.warn("Address not found:", address);
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
