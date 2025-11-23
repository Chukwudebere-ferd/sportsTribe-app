// API Configuration for Sports Tribe App - Using Vercel Proxy
const API_CONFIG = {
  // Using our own Vercel proxy with TheSportsDB (completely free!)
  footballData: {
    baseUrl: window.location.origin + "/api/football",
    headers: {
      "Content-Type": "application/json",
    },
  },
  newsApi: {
    // Using our own Vercel proxy for news
    baseUrl: window.location.origin + "/api/news",
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
