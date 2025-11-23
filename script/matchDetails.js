// Match Details Page - Feature 2 (Uses TheSportsDB)
import { API_CONFIG, apiFetch } from "./apiConfig.js";

class MatchDetails {
  constructor() {
    this.detailsContainer = document.getElementById("match-details-container");
    this.loadingElement = document.getElementById("match-details-loading");
    this.errorElement = document.getElementById("match-details-error");
    this.currentMatchId = null;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    // Listen for page changes to load match details
    document.addEventListener("DOMContentLoaded", () => {
      this.setupPageListener();
    });
  }

  setupPageListener() {
    // Check when match details page becomes active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.target.classList.contains("active") &&
          mutation.target.id === "match-details"
        ) {
          this.loadMatchDetails();
        } else if (
          mutation.target.id === "match-details" &&
          !mutation.target.classList.contains("active")
        ) {
          this.stopAutoRefresh();
        }
      });
    });

    const matchDetailsPage = document.getElementById("match-details");
    if (matchDetailsPage) {
      observer.observe(matchDetailsPage, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  async loadMatchDetails() {
    const matchId = sessionStorage.getItem("selectedMatchId");

    if (!matchId) {
      this.showError(
        "No match selected. Please select a match from Live Scores."
      );
      return;
    }

    this.currentMatchId = matchId;

    try {
      this.showLoading();

      // Get specific match details from TheSportsDB
      const url = `${API_CONFIG.footballData.baseUrl}?type=match&id=${matchId}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      // TheSportsDB returns events.event array
      const match = data.events && data.events[0];

      if (match) {
        this.displayMatchDetails(match);
        this.hideLoading();
      } else {
        throw new Error("Match not found");
      }
    } catch (error) {
      console.error("Error loading match details:", error);
      this.showError("Failed to load match details. Please try again later.");
      this.hideLoading();
    }
  }

  displayMatchDetails(match) {
    const homeTeam = match.strHomeTeam;
    const awayTeam = match.strAwayTeam;
    const homeScore = match.intHomeScore ?? 0;
    const awayScore = match.intAwayScore ?? 0;
    const league = match.strLeague;
    const status = this.getMatchStatus(match);
    const kickoffTime = this.formatDateTime(
      match.strTimestamp || match.dateEvent
    );
    const venue = match.strVenue || "TBA";

    this.detailsContainer.innerHTML = `
      <div class="match-details-card">
        <!-- Back Button -->
        <button class="back-btn" onclick="window.history.back()">
          ← Back to Scores
        </button>

        <!-- Match Status -->
        <div class="match-status-header ${status.class}">
          ${status.text}
        </div>

        <!-- League Info -->
        <div class="league-info">
          <h3>🏆 ${league}</h3>
          <p class="match-date">${kickoffTime}</p>
        </div>

        <!-- Teams and Score -->
        <div class="teams-display">
          <div class="team-detail home">
            <h2>${homeTeam}</h2>
            <div class="team-score">${homeScore}</div>
          </div>
          
          <div class="score-separator">-</div>
          
          <div class="team-detail away">
            <h2>${awayTeam}</h2>
            <div class="team-score">${awayScore}</div>
          </div>
        </div>

        <!-- Match Info -->
        <div class="match-info-grid">
          <div class="info-item">
            <div class="info-label">🏟️ Venue</div>
            <div class="info-value">${venue}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">📊 Status</div>
            <div class="info-value">${match.strStatus || "Scheduled"}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">🌍 Country</div>
            <div class="info-value">${match.strCountry || "International"}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">⚽ Competition</div>
            <div class="info-value">${league}</div>
          </div>
        </div>
      </div>
    `;

    // Add back button listener
    const backBtn = this.detailsContainer.querySelector(".back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const scoresNav = document.querySelector('[data-page="live-scores"]');
        if (scoresNav) scoresNav.click();
      });
    }
  }

  getMatchStatus(match) {
    const status = match.strStatus || "";

    if (status.includes("Finished") || status === "FT") {
      return { text: "✅ FINISHED", class: "finished" };
    } else if (status.includes("Postponed")) {
      return { text: "⏱️ POSTPONED", class: "scheduled" };
    } else {
      return { text: "⏱️ SCHEDULED", class: "scheduled" };
    }
  }

  formatDateTime(timestamp) {
    if (!timestamp) return "TBD";

    try {
      const date = new Date(timestamp);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (e) {
      return "TBD";
    }
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  showLoading() {
    this.loadingElement.classList.remove("hidden");
    this.detailsContainer.innerHTML = "";
    this.errorElement.classList.add("hidden");
  }

  hideLoading() {
    this.loadingElement.classList.add("hidden");
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.classList.remove("hidden");
    this.detailsContainer.innerHTML = "";
  }
}

// Initialize Match Details
const matchDetails = new MatchDetails();

export { matchDetails };
