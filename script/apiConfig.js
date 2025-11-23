// API Configuration for Sports Tribe App
const API_CONFIG = {
  // Using API-Football via RapidAPI (better CORS support)
  footballData: {
    baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
    apiKey: "938c90c97c5f4cd781d0332677a916a5",
    headers: {
      "X-RapidAPI-Key": "938c90c97c5f4cd781d0332677a916a5",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  },
  newsApi: {
    baseUrl: "https://newsapi.org/v2",
    apiKey: "96d093d5d3404ae8b87c1259b554c412",
  },
};

// Common fetch wrapper with error handling
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

// Export for use in other scripts
export { API_CONFIG, apiFetch };
