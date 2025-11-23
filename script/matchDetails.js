// Match Details Page - Feature 2
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

      const url = `${API_CONFIG.footballData.baseUrl}/matches/${matchId}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      this.displayMatchDetails(data);
      this.hideLoading();

      // Start auto-refresh for live matches
      if (data.status === "IN_PLAY" || data.status === "PAUSED") {
        this.startAutoRefresh();
      }
    } catch (error) {
      console.error("Error loading match details:", error);
      this.showError("Failed to load match details. Please try again later.");
      this.hideLoading();
    }
  }

  displayMatchDetails(match) {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;
    const homeScore =
      match.score.fullTime.home ?? match.score.halfTime.home ?? 0;
    const awayScore =
      match.score.fullTime.away ?? match.score.halfTime.away ?? 0;
    const league = match.competition.name;
    const status = this.getMatchStatus(match.status);
    const kickoffTime = this.formatDateTime(match.utcDate);
    const venue = match.venue || "TBA";
    const referee =
      match.referees && match.referees.length > 0
        ? match.referees[0].name
        : "TBA";

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
            <div class="info-label">👮 Referee</div>
            <div class="info-value">${referee}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">📊 Status</div>
            <div class="info-value">${match.status.replace("_", " ")}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">⚽ Competition</div>
            <div class="info-value">${league}</div>
          </div>
        </div>

        ${this.renderScoreBreakdown(match.score)}
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

  renderScoreBreakdown(score) {
    const hasHalfTime =
      score.halfTime.home !== null && score.halfTime.away !== null;
    const hasFullTime =
      score.fullTime.home !== null && score.fullTime.away !== null;

    if (!hasHalfTime && !hasFullTime) {
      return "";
    }

    return `
      <div class="score-breakdown">
        <h4>Score Breakdown</h4>
        <table class="score-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Home</th>
              <th>Away</th>
            </tr>
          </thead>
          <tbody>
            ${
              hasHalfTime
                ? `
              <tr>
                <td>Half Time</td>
                <td>${score.halfTime.home}</td>
                <td>${score.halfTime.away}</td>
              </tr>
            `
                : ""
            }
            ${
              hasFullTime
                ? `
              <tr>
                <td>Full Time</td>
                <td>${score.fullTime.home}</td>
                <td>${score.fullTime.away}</td>
              </tr>
            `
                : ""
            }
          </tbody>
        </table>
      </div>
    `;
  }

  getMatchStatus(status) {
    switch (status) {
      case "IN_PLAY":
      case "PAUSED":
        return { text: "🔴 LIVE", class: "live" };
      case "FINISHED":
        return { text: "✅ FINISHED", class: "finished" };
      case "SCHEDULED":
      case "TIMED":
        return { text: "⏱️ UPCOMING", class: "scheduled" };
      default:
        return { text: status, class: "scheduled" };
    }
  }

  formatDateTime(utcDate) {
    const date = new Date(utcDate);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  }

  startAutoRefresh() {
    // Refresh every 30 seconds for live matches
    this.refreshInterval = setInterval(() => {
      console.log("Auto-refreshing match details...");
      this.loadMatchDetails();
    }, 30000);
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
