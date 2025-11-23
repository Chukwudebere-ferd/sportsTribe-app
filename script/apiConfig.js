// API Configuration for Sports Tribe App
const API_CONFIG = {
  footballData: {
    baseUrl: "https://api.football-data.org/v4",
    apiKey: "938c90c97c5f4cd781d0332677a916a5",
    headers: {
      "X-Auth-Token": "938c90c97c5f4cd781d0332677a916a5",
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
