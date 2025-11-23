const apiKey = "9290e632f9b30d247cfc82a5e8c3533e"; // Replace with your API-Football key
const apiUrl = `https://api-football.com/v1/news?league=39`; // Example: English Premier League (ID 39)
const newsContent = document.getElementById("football-news-content");

fetch(apiUrl, {
  headers: {
    "X-RapidAPI-Key": apiKey // Use your API key here
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    if (data.data && data.data.length > 0) {
      newsContent.textContent = data.data[0].title || "No title available";
    } else {
      newsContent.textContent = "No football news available.";
    }
  })
  .catch(error => {
    newsContent.textContent = "Failed to load football news. Check API key or connection.";
    console.error("Error:", error);
  });