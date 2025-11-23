// Serverless function to proxy news API requests
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
    const apiUrl =
      "https://newsapi.org/v2/everything?q=football OR soccer&language=en&sortBy=publishedAt&pageSize=20&apiKey=96d093d5d3404ae8b87c1259b554c412";

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("News proxy error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
