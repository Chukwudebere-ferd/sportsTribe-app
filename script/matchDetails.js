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

      // Use our proxy endpoint
      const url = `${API_CONFIG.footballData.baseUrl}?endpoint=fixtures?id=${matchId}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      // API-Football returns data in response.response array
      const match = data.response && data.response[0];

      if (match) {
        this.displayMatchDetails(match);
        this.hideLoading();

        // Start auto-refresh for live matches
        const liveStatuses = ["1H", "2H", "HT", "ET", "P", "LIVE"];
        if (liveStatuses.includes(match.fixture.status.short)) {
          this.startAutoRefresh();
        }
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
    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const homeScore = match.goals.home ?? 0;
    const awayScore = match.goals.away ?? 0;
    const league = match.league.name;
    const status = this.getMatchStatus(match.fixture.status.short);
    const kickoffTime = this.formatDateTime(match.fixture.date);
    const venue = match.fixture.venue.name || "TBA";
    const referee = match.fixture.referee || "TBA";

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
            <div class="info-value">${match.fixture.status.long}</div>
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
      score.halftime.home !== null && score.halftime.away !== null;
    const hasFullTime =
      score.fulltime.home !== null && score.fulltime.away !== null;

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
                <td>${score.halftime.home}</td>
                <td>${score.halftime.away}</td>
              </tr>
            `
                : ""
            }
            ${
              hasFullTime
                ? `
              <tr>
                <td>Full Time</td>
                <td>${score.fulltime.home}</td>
                <td>${score.fulltime.away}</td>
              </tr>
            `
                : ""
            }
            ${
              score.extratime.home !== null
                ? `
              <tr>
                <td>Extra Time</td>
                <td>${score.extratime.home}</td>
                <td>${score.extratime.away}</td>
              </tr>
            `
                : ""
            }
            ${
              score.penalty.home !== null
                ? `
              <tr>
                <td>Penalties</td>
                <td>${score.penalty.home}</td>
                <td>${score.penalty.away}</td>
              </tr>
            `
                : ""
            }
          </tbody>
        </table>
      </div>
    `;
  }

  getMatchStatus(statusShort) {
    const liveStatuses = ["1H", "2H", "HT", "ET", "P", "LIVE"];
    const finishedStatuses = ["FT", "AET", "PEN"];

    if (liveStatuses.includes(statusShort)) {
      return { text: "🔴 LIVE", class: "live" };
    } else if (finishedStatuses.includes(statusShort)) {
      return { text: "✅ FINISHED", class: "finished" };
    } else {
      return { text: "⏱️ UPCOMING", class: "scheduled" };
    }
  }

  formatDateTime(dateString) {
    const date = new Date(dateString);
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
