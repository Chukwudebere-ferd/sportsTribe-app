// Navigation Manager for Sports Tribe App

class NavigationManager {
  constructor() {
    this.currentPage = "live-scores";
    this.init();
  }

  init() {
    // Set up navigation listeners
    document.addEventListener("DOMContentLoaded", () => {
      this.setupNavigation();
      this.showPage(this.currentPage);
    });
  }


  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const pageId = item.getAttribute("data-page");
        this.navigateTo(pageId);
      });
    });
  }

  navigateTo(pageId) {
    if (pageId === this.currentPage) return;

    this.currentPage = pageId;
    this.showPage(pageId);
    this.updateActiveNav(pageId);
  }

  showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll(".page");
    pages.forEach((page) => page.classList.remove("active"));

    // Show selected page
    const activePage = document.getElementById(pageId);
    if (activePage) {
      activePage.classList.add("active");
    }
  }

  updateActiveNav(pageId) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));

    // Add active class to selected nav item
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) {
      activeNav.classList.add("active");
    }
  }

  // Method to navigate to match details with match ID
  goToMatchDetails(matchId) {
    // Store match ID in session storage
    sessionStorage.setItem("selectedMatchId", matchId);
    this.navigateTo("match-details");
  }

  // Go back to previous page
  goBack() {
    this.navigateTo("live-scores");
  }
}

// Create global navigation instance
const navManager = new NavigationManager();

// Export for use in other scripts
export { navManager };
