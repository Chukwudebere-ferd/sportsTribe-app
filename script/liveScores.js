// Live Scores Page - Feature 1
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

      const today = new Date().toISOString().split("T")[0];
      const url = `${API_CONFIG.footballData.baseUrl}/matches?date=${today}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      this.displayMatches(data.matches || []);
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
        const matchId = matches[index].id;
        this.goToMatchDetails(matchId);
      });
    });
  }

  createMatchCard(match) {
    const status = this.getMatchStatus(match.status);
    const homeTeam = match.homeTeam.name || match.homeTeam.shortName;
    const awayTeam = match.awayTeam.name || match.awayTeam.shortName;
    const homeScore =
      match.score.fullTime.home ?? match.score.halfTime.home ?? "-";
    const awayScore =
      match.score.fullTime.away ?? match.score.halfTime.away ?? "-";
    const league = match.competition.name;
    const time = this.formatMatchTime(match.utcDate);

    const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
    const isFinished = match.status === "FINISHED";
    const scoreDisplay =
      isLive || isFinished
        ? `<div class="match-score">${homeScore} - ${awayScore}</div>`
        : `<div class="match-vs">VS</div>`;

    return `
      <div class="match-card" data-match-id="${match.id}">
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

  getMatchStatus(status) {
    switch (status) {
      case "IN_PLAY":
      case "PAUSED":
        return { text: "LIVE", class: "live" };
      case "FINISHED":
        return { text: "FINISHED", class: "finished" };
      case "SCHEDULED":
      case "TIMED":
        return { text: "UPCOMING", class: "scheduled" };
      case "POSTPONED":
        return { text: "POSTPONED", class: "scheduled" };
      case "CANCELLED":
        return { text: "CANCELLED", class: "scheduled" };
      default:
        return { text: status, class: "scheduled" };
    }
  }

  formatMatchTime(utcDate) {
    const date = new Date(utcDate);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
