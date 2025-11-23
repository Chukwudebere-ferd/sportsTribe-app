// Serverless function to proxy football API requests
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { endpoint } = req.query;
    const apiUrl = `https://api-football-v1.p.rapidapi.com/v3/${endpoint}`;

    const response = await fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": "938c90c97c5f4cd781d0332677a916a5",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
