// Vision Algorithms Website JavaScript
// Regular script with shadcn UI functionality

// Simple cn utility function for class merging
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// DOM Elements
class VisionAlgorithmsApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupStatsAnimation();
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupVideoControls();
    this.setupCurrentYear();
    this.setupIntersectionObserver();
  }

  // Navigation setup
  setupNavigation() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    const scrollThreshold = 50;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > scrollThreshold) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }

      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
    };

    // Throttle scroll events
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial check
    handleScroll();
  }

  // Stats counter animation
  setupStatsAnimation() {
    const statElements = document.querySelectorAll(".stat-number[data-count]");

    if (!statElements.length) {
      console.warn("No stat elements found");
      return;
    }

    // Initialize live statistics if StatsAPI is available
    if (typeof StatsAPI !== 'undefined') {
      this.initializeLiveStats();
    } else {
      // Fallback to static animation
      this.animateStaticStats(statElements);
    }
  }

  // Animate static stats (fallback)
  animateStaticStats(statElements) {
    setTimeout(() => {
      statElements.forEach((stat) => {
        const target = parseInt(stat.getAttribute("data-count"));

        if (isNaN(target)) {
          return;
        }

        this.animateCounter(stat, 0, target, 2000);
      });
    }, 1000);
  }

  // Initialize live statistics from API
  async initializeLiveStats() {
    const statsAPI = new StatsAPI();
    
    // Show loading state
    this.setStatsLoadingState(true);

    try {
      // Fetch initial stats
      const stats = await statsAPI.fetchAllStats();
      this.updateStatsDisplay(stats);
      
      // Start auto-updating (every 5 minutes)
      this.statsUpdateCleanup = statsAPI.startAutoUpdate((newStats) => {
        this.updateStatsDisplay(newStats, true); // true = animate update
      });

      // Add refresh button functionality
      this.setupStatsRefresh(statsAPI);
      
      // Show last updated time
      this.updateLastRefreshTime(stats.lastUpdated);
    } catch (error) {
      console.error('Failed to initialize live stats:', error);
      // Fall back to static values
      const statElements = document.querySelectorAll(".stat-number[data-count]");
      this.animateStaticStats(statElements);
    } finally {
      this.setStatsLoadingState(false);
    }
  }

  // Update stats display with fetched data
  updateStatsDisplay(stats, animate = true) {
    const statsMap = [
      { selector: '[data-stat="steam-wishlists"]', value: stats.steam?.wishlists || 200 },
      { selector: '[data-stat="reddit-members"]', value: stats.reddit?.members || 50 },
      { selector: '[data-stat="reddit-views"]', value: stats.views?.estimatedViewsK || 178 }
    ];

    statsMap.forEach(({ selector, value }) => {
      // Update ALL elements with this data attribute (hero section AND stats section)
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (animate) {
          const currentValue = parseInt(element.textContent) || 0;
          this.animateCounter(element, currentValue, value, 1000);
        } else {
          element.textContent = value;
        }
      });
    });

    // Update all static text mentions
    this.updateStaticStatReferences(stats);
    
    // Update last refresh time
    if (stats.lastUpdated) {
      this.updateLastRefreshTime(stats.lastUpdated);
    }
  }

  // Animate counter from current to target value
  animateCounter(element, start, end, duration) {
    if (start === end) {
      element.textContent = end;
      return;
    }

    const range = end - start;
    const increment = range / (duration / 50);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        element.textContent = Math.round(end);
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 50);
  }

  // Update static text references to stats
  updateStaticStatReferences(stats) {
    // Update contact section Reddit members
    const redditContact = document.querySelector('.contact-value');
    if (redditContact && redditContact.textContent.includes('Members')) {
      const members = stats.reddit?.members || 50;
      redditContact.textContent = `${members}+ Members`;
    }

    // Update about section text
    const aboutSection = document.querySelector('#about .space-y-6');
    if (aboutSection) {
      const paragraphs = aboutSection.querySelectorAll('p');
      paragraphs.forEach(p => {
        let text = p.innerHTML;
        
        // Update wishlists
        if (text.includes('Steam wishlists')) {
          const wishlists = stats.steam?.wishlists || 200;
          text = text.replace(/\d+\+?\s*Steam wishlists/g, `${wishlists}+ Steam wishlists`);
        }
        
        // Update Reddit members
        if (text.includes('Reddit community members')) {
          const members = stats.reddit?.members || 50;
          text = text.replace(/\d+\+?\s*Reddit community members/g, `${members}+ Reddit community members`);
        }
        
        // Update Reddit views
        if (text.includes('Reddit views')) {
          const views = stats.views?.estimatedViewsK || 178;
          text = text.replace(/\d+,?\d*\s*Reddit views/g, `${views * 1000} Reddit views`);
        }
        
        p.innerHTML = text;
      });
    }
  }

  // Set loading state for stats
  setStatsLoadingState(isLoading) {
    const statCards = document.querySelectorAll('.stat-card, .company-stat');
    statCards.forEach(card => {
      if (isLoading) {
        card.classList.add('loading');
      } else {
        card.classList.remove('loading');
      }
    });
  }

  // Setup manual stats refresh button
  setupStatsRefresh(statsAPI) {
    const refreshButton = document.querySelector('#refresh-stats');
    if (refreshButton) {
      refreshButton.addEventListener('click', async () => {
        refreshButton.disabled = true;
        refreshButton.classList.add('loading');
        
        try {
          const stats = await statsAPI.refresh();
          this.updateStatsDisplay(stats, true);
          
          // Show success feedback
          this.showRefreshFeedback('Stats updated successfully', 'success');
        } catch (error) {
          console.error('Failed to refresh stats:', error);
          this.showRefreshFeedback('Failed to refresh stats', 'error');
        } finally {
          refreshButton.disabled = false;
          refreshButton.classList.remove('loading');
        }
      });
    }
  }

  // Update last refresh time display
  updateLastRefreshTime(timestamp) {
    const lastUpdateElement = document.querySelector('#last-update-time');
    if (lastUpdateElement) {
      const date = new Date(timestamp);
      const timeString = date.toLocaleTimeString();
      lastUpdateElement.textContent = `Last updated: ${timeString}`;
    }
  }

  // Show refresh feedback
  showRefreshFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `refresh-feedback ${type}`;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      feedback.classList.remove('show');
      setTimeout(() => feedback.remove(), 300);
    }, 3000);
  }

  // Smooth scrolling for anchor links
  setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        if (href === "#") return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          const headerHeight =
            document.querySelector(".navbar")?.offsetHeight || 0;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          // Update URL without page jump
          history.pushState(null, null, href);
        }
      });
    });
  }

  // Mobile menu functionality
  setupMobileMenu() {
    const mobileMenuButton = document.querySelector(".mobile-menu-button");
    const navMenu = document.querySelector(".nav-menu");

    if (!mobileMenuButton || !navMenu) return;

    mobileMenuButton.addEventListener("click", () => {
      const isExpanded =
        mobileMenuButton.getAttribute("aria-expanded") === "true";

      mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
      navMenu.classList.toggle("mobile-open");

      // Toggle menu icon
      const icon = mobileMenuButton.querySelector("svg");
      if (icon) {
        if (!isExpanded) {
          // Change to close icon
          icon.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        } else {
          // Change back to menu icon
          icon.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        }
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        mobileMenuButton.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("mobile-open");

        // Reset menu icon
        const icon = mobileMenuButton.querySelector("svg");
        if (icon) {
          icon.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        }
      }
    });
  }

  // Video controls
  setupVideoControls() {
    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
      // Add loading state
      video.addEventListener("loadstart", () => {
        video.classList.add("loading");
      });

      video.addEventListener("canplay", () => {
        video.classList.remove("loading");
      });

      video.addEventListener("error", () => {
        video.classList.add("error");
        console.error("Video failed to load:", video.src);
      });
    });
  }

  // Set current year in footer
  setupCurrentYear() {
    const yearElement = document.querySelector("#current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // Intersection Observer for animations
  setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll(
      ".card, .stat-card, .contact-link",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    animatedElements.forEach((element) => observer.observe(element));
  }

  // Utility function to debounce events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Utility function for element visibility
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new VisionAlgorithmsApp();
});

// Export for potential module usage
// export default VisionAlgorithmsApp;
