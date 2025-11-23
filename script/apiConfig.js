// API Configuration for Sports Tribe App - Using Vercel Proxy
const API_CONFIG = {
  // Using our own Vercel proxy to bypass CORS
  footballData: {
    // In production, this will be your Vercel URL
    baseUrl: window.location.origin + "/api/football",
    apiKey: "938c90c97c5f4cd781d0332677a916a5",
    headers: {
      "Content-Type": "application/json",
    },
  },
  newsApi: {
    // Using our own Vercel proxy for news too
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
