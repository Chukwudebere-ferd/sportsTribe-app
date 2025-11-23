// Sports News Feed - Feature 3
import { API_CONFIG, apiFetch } from "./apiConfig.js";

class NewsFeed {
  constructor() {
    this.newsContainer = document.getElementById("news-container");
    this.loadingElement = document.getElementById("news-loading");
    this.errorElement = document.getElementById("news-error");
    this.init();
  }

  init() {
    // Listen for page changes to load news
    document.addEventListener("DOMContentLoaded", () => {
      this.setupPageListener();
    });
  }

  setupPageListener() {
    // Check when news page becomes active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.target.classList.contains("active") &&
          mutation.target.id === "news"
        ) {
          // Always reload news to get latest articles
          this.loadNews();
        }
      });
    });

    const newsPage = document.getElementById("news");
    if (newsPage) {
      observer.observe(newsPage, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  async loadNews() {
    try {
      this.showLoading();

      // Fetch football/soccer news from NewsAPI
      const url = `${API_CONFIG.newsApi.baseUrl}/everything?q=football OR soccer&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_CONFIG.newsApi.apiKey}`;

      const data = await apiFetch(url);

      this.displayNews(data.articles || []);
      this.hideLoading();
    } catch (error) {
      console.error("Error loading news:", error);
      this.showError("Failed to load football news. Please try again later.");
      this.hideLoading();
    }
  }

  displayNews(articles) {
    if (!articles || articles.length === 0) {
      this.newsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📰</div>
          <h3>No News Available</h3>
          <p>Check back later for the latest football news!</p>
        </div>
      `;
      return;
    }

    // Filter articles with images
    const articlesWithImages = articles.filter((article) => article.urlToImage);

    this.newsContainer.innerHTML = articlesWithImages
      .map((article) => this.createNewsCard(article))
      .join("");

    // Add click handlers to "Read More" buttons
    const readMoreBtns = document.querySelectorAll(".read-more-btn");
    readMoreBtns.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openArticle(articlesWithImages[index].url);
      });
    });
  }

  createNewsCard(article) {
    const title = article.title || "Untitled";
    const description = article.description || "No description available.";
    const imageUrl =
      article.urlToImage || "https://via.placeholder.com/400x200?text=No+Image";
    const source = article.source.name || "Unknown Source";
    const publishedDate = this.formatDate(article.publishedAt);

    // Truncate description to 150 characters
    const truncatedDescription =
      description.length > 150
        ? description.substring(0, 150) + "..."
        : description;

    return `
      <div class="news-card">
        <img src="${imageUrl}" alt="${title}" class="news-image" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Available'">
        <div class="news-content">
          <h3 class="news-title">${title}</h3>
          <p class="news-description">${truncatedDescription}</p>
          <div class="news-meta">
            <span class="news-source">📌 ${source}</span>
            <span class="news-date">📅 ${publishedDate}</span>
          </div>
          <button class="read-more-btn">Read More →</button>
        </div>
      </div>
    `;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  }

  openArticle(url) {
    // Open article in same window to keep user in app
    // This prevents opening external Chrome browser in app creators
    window.location.href = url;
  }

  showLoading() {
    this.loadingElement.classList.remove("hidden");
    this.newsContainer.innerHTML = "";
    this.errorElement.classList.add("hidden");
  }

  hideLoading() {
    this.loadingElement.classList.add("hidden");
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.classList.remove("hidden");
    this.newsContainer.innerHTML = "";
  }
}

// Initialize News Feed
const newsFeed = new NewsFeed();

export { newsFeed };
