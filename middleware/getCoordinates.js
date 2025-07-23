export async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)",
    },
  });

  const data = await response.json();

  if (data.length === 0) {
    // throw new Error();
    console.log("Address not found");
    return;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
