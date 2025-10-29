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

    // Start animation after page load
    setTimeout(() => {
      statElements.forEach((stat, index) => {
        const target = parseInt(stat.getAttribute("data-count"));

        if (isNaN(target)) {
          return;
        }

        let current = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 50); // Update every 50ms

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 50);
      });
    }, 1000);
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
