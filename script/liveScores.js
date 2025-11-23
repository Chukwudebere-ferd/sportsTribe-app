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
      const url = `${API_CONFIG.footballData.baseUrl}/fixtures?date=${today}`;

      const data = await apiFetch(url, {
        headers: API_CONFIG.footballData.headers,
      });

      // API-Football returns data in response.response array
      this.displayMatches(data.response || []);
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
        const matchId = matches[index].fixture.id;
        this.goToMatchDetails(matchId);
      });
    });
  }

  createMatchCard(match) {
    const status = this.getMatchStatus(match.fixture.status.short);
    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const homeScore = match.goals.home ?? "-";
    const awayScore = match.goals.away ?? "-";
    const league = match.league.name;
    const time = this.formatMatchTime(match.fixture.date);

    const isLive = ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(
      match.fixture.status.short
    );
    const isFinished = match.fixture.status.short === "FT";
    const scoreDisplay =
      isLive || isFinished
        ? `<div class="match-score">${homeScore} - ${awayScore}</div>`
        : `<div class="match-vs">VS</div>`;

    return `
      <div class="match-card" data-match-id="${match.fixture.id}">
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

  getMatchStatus(statusShort) {
    // API-Football status codes
    const liveStatuses = ["1H", "2H", "HT", "ET", "P", "LIVE"];
    const finishedStatuses = ["FT", "AET", "PEN"];

    if (liveStatuses.includes(statusShort)) {
      return { text: "LIVE", class: "live" };
    } else if (finishedStatuses.includes(statusShort)) {
      return { text: "FINISHED", class: "finished" };
    } else if (["TBD", "NS"].includes(statusShort)) {
      return { text: "UPCOMING", class: "scheduled" };
    } else if (["PST", "CANC"].includes(statusShort)) {
      return { text: "POSTPONED", class: "scheduled" };
    } else {
      return { text: statusShort, class: "scheduled" };
    }
  }

  formatMatchTime(dateString) {
    const date = new Date(dateString);
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
