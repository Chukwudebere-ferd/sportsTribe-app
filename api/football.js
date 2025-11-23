// Serverless function to proxy football API requests using TheSportsDB
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
    const { type, id } = req.query;
    let apiUrl;

    // TheSportsDB free API
    if (type === "next") {
      // Get next 15 events for a league
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`;
    } else if (type === "last") {
      // Get last 15 events for a league
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${id}`;
    } else if (type === "match") {
      // Get specific match details
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${id}`;
    } else {
      // Default: Get today's events (all leagues)
      const today = new Date().toISOString().split("T")[0];
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
