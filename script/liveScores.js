// Live Scores Page - Feature 1 (Uses TheSportsDB)
import { API_CONFIG, apiFetch } from "./apiConfig.js";

class LiveScores {
  constructor() {
    this.matchesContainer = document.getElementById("matches-container");
    this.loadingElement = document.getElementById("matches-loading");
    this.errorElement = document.getElementById("matches-error");
    this.refreshInterval = null;
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.loadTodayMatches();
      this.startAutoRefresh();
    });
  }

  async loadTodayMatches() {
    try {
      this.showLoading();

      // Get today's soccer events from TheSportsDB
      const url = `${API_CONFIG.footballData.baseUrl}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      // TheSportsDB returns events.event array
      this.displayMatches(data.events || []);
      this.hideLoading();
    } catch (error) {
      console.error("Error loading matches:", error);
      this.showError("Failed to load today's matches. Please try again later.");
      this.hideLoading();
    }
  }

  displayMatches(matches) {
    if (!matches || matches.length === 0) {
      this.matchesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚽</div>
          <h3>No Matches Today</h3>
          <p>Check back later for upcoming matches!</p>
        </div>
      `;
      return;
    }

    this.matchesContainer.innerHTML = matches
      .map((match) => this.createMatchCard(match))
      .join("");

    // Add click handlers to match cards
    const matchCards = document.querySelectorAll(".match-card");
    matchCards.forEach((card, index) => {
      card.addEventListener("click", () => {
        const matchId = matches[index].idEvent;
        this.goToMatchDetails(matchId);
      });
    });
  }

  createMatchCard(match) {
    const status = this.getMatchStatus(match);
    const homeTeam = match.strHomeTeam;
    const awayTeam = match.strAwayTeam;
    const homeScore = match.intHomeScore || "-";
    const awayScore = match.intAwayScore || "-";
    const league = match.strLeague;
    const time = this.formatMatchTime(match.strTimestamp || match.dateEvent);

    const isFinished =
      match.strStatus === "Match Finished" || match.strStatus === "FT";
    const scoreDisplay =
      isFinished && match.intHomeScore !== null
        ? `<div class="match-score">${homeScore} - ${awayScore}</div>`
        : `<div class="match-vs">VS</div>`;

    return `
      <div class="match-card" data-match-id="${match.idEvent}">
        <div class="match-status ${status.class}">${status.text}</div>
        
        <div class="match-teams">
          <div class="team">
            <div class="team-name">${homeTeam}</div>
          </div>
          
          ${scoreDisplay}
          
          <div class="team">
            <div class="team-name">${awayTeam}</div>
          </div>
        </div>
        
        <div class="match-info">
          <div class="match-time">🕐 ${time}</div>
          <div class="match-league">🏆 ${league}</div>
        </div>
      </div>
    `;
  }

  getMatchStatus(match) {
    const status = match.strStatus || "";

    if (status.includes("Finished") || status === "FT") {
      return { text: "FINISHED", class: "finished" };
    } else if (status.includes("Postponed")) {
      return { text: "POSTPONED", class: "scheduled" };
    } else {
      return { text: "SCHEDULED", class: "scheduled" };
    }
  }

  formatMatchTime(timestamp) {
    if (!timestamp) return "TBD";

    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (e) {
      return "TBD";
    }
  }

  goToMatchDetails(matchId) {
    // Store match ID for match details page
    sessionStorage.setItem("selectedMatchId", matchId);

    // Navigate to match details page
    const matchDetailsNav = document.querySelector(
      '[data-page="match-details"]'
    );
    if (matchDetailsNav) {
      matchDetailsNav.click();
    }
  }

  startAutoRefresh() {
    // Refresh every 60 seconds
    this.refreshInterval = setInterval(() => {
      console.log("Auto-refreshing matches...");
      this.loadTodayMatches();
    }, 60000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  showLoading() {
    this.loadingElement.classList.remove("hidden");
    this.matchesContainer.innerHTML = "";
    this.errorElement.classList.add("hidden");
  }

  hideLoading() {
    this.loadingElement.classList.add("hidden");
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.classList.remove("hidden");
    this.matchesContainer.innerHTML = "";
  }
}

// Initialize Live Scores
const liveScores = new LiveScores();

export { liveScores };
