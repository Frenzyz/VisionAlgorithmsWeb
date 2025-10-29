// Vision Algorithms - Modern JavaScript Framework
// Enhanced with modern patterns, better error handling, and improved UX

class VisionAlgorithms {
  constructor() {
    this.init();
  }

  init() {
    this.setupErrorHandling();
    this.setupNavigation();
    this.setupAnimations();
    this.setupVideoControls();
    this.setupCounters();
    this.setupPerformance();
    this.setupAccessibility();
    this.updateDynamicContent();
  }

  // Error Handling
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Vision Algorithms Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
    });
  }

  // Navigation
  setupNavigation() {
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupActiveNav();
  }

  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('active');

        // Update hamburger animation
        const hamburger = toggle.querySelector('.hamburger');
        if (hamburger) {
          hamburger.style.transform = isExpanded ? 'rotate(0)' : 'rotate(45deg)';
          hamburger.style.backgroundColor = isExpanded ? 'currentColor' : 'transparent';

          if (!isExpanded) {
            hamburger.style.setProperty('--before-transform', 'rotate(90deg) translate(6px, 0)');
            hamburger.style.setProperty('--after-transform', 'rotate(-90deg) translate(-6px, 0)');
          } else {
            hamburger.style.setProperty('--before-transform', 'none');
            hamburger.style.setProperty('--after-transform', 'none');
          }
        }
      });
    }
  }

  setupActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // Animations
  setupAnimations() {
    this.setupFadeInAnimations();
    this.setupParallaxEffect();
    this.setupHoverEffects();
  }

  setupFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  setupParallaxEffect() {
    const hero = document.querySelector('.hero');

    if (!hero) return;

    // Set proper z-index and positioning for parallax
    hero.style.zIndex = '1';
    hero.style.position = 'relative';

    // Ensure sections after hero have proper stacking context
    const sectionsAfterHero = document.querySelectorAll('section:not(.hero)');
    sectionsAfterHero.forEach(section => {
      section.style.position = 'relative';
      section.style.zIndex = '2';
      section.style.backgroundColor = 'inherit'; // Ensure background covers parallax
    });

    // Ensure footer has proper stacking
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.style.position = 'relative';
      footer.style.zIndex = '3';
    }

    // Use requestAnimationFrame for smoother performance
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.2; // Further reduced speed for better UX

      // Only apply parallax when hero is in view
      const heroRect = hero.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate visible area percentage
      const visibleHeight = Math.min(heroRect.bottom, windowHeight) - Math.max(heroRect.top, 0);
      const visiblePercentage = Math.max(0, visibleHeight / windowHeight);

      // Only apply parallax when hero is significantly visible
      if (visiblePercentage > 0.2 && heroRect.top < windowHeight && heroRect.bottom > 0) {
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      } else {
        hero.style.transform = 'translateY(0)';
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Reset on resize to prevent layout issues
    window.addEventListener('resize', () => {
      hero.style.transform = 'translateY(0)';
    });
  }

  setupHoverEffects() {
    // Card hover effects
    const cards = document.querySelectorAll('.feature-card, .stat-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
      });

      // Ripple effect
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });
    });
  }

  createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 600ms linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // Video Controls
  setupVideoControls() {
    const video = document.querySelector('.product-video');
    const playButton = document.querySelector('.video-play-btn');
    const videoControls = document.querySelector('.video-controls');

    if (!video || !playButton) return;

    const togglePlayback = () => {
      if (video.paused) {
        video.play().catch(console.error);
        playButton.style.opacity = '0';
      } else {
        video.pause();
        playButton.style.opacity = '1';
      }
    };

    // Click events
    video.addEventListener('click', togglePlayback);
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });

    // Video state changes
    video.addEventListener('play', () => {
      videoControls.style.opacity = '0';
    });

    video.addEventListener('pause', () => {
      videoControls.style.opacity = '1';
    });

    video.addEventListener('ended', () => {
      videoControls.style.opacity = '1';
    });

    // Keyboard support
    video.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        togglePlayback();
      }
    });
  }

  // Counter Animations
  setupCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(easedProgress * target);

      element.textContent = currentValue === target ? `${target}+` : currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  // Performance Optimizations
  setupPerformance() {
    // Lazy loading for images and videos
    this.setupLazyLoading();

    // Preload critical resources
    this.preloadResources();

    // Performance monitoring
    this.setupPerformanceMonitoring();
  }

  setupLazyLoading() {
    const lazyMedia = document.querySelectorAll('[data-src]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const media = entry.target;
          media.src = media.getAttribute('data-src');
          media.removeAttribute('data-src');
          observer.unobserve(media);
        }
      });
    });

    lazyMedia.forEach(media => observer.observe(media));
  }

  preloadResources() {
    const resources = [
      'images/visionappiconinverted 2.svg',
      'videos/Steam Trailer Finalized.mp4'
    ];

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.includes('.mp4')) {
        link.as = 'video';
      } else if (resource.includes('images/')) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  // Accessibility
  setupAccessibility() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals/menus
      if (e.key === 'Escape') {
        const mobileMenu = document.querySelector('.nav-menu.active');
        if (mobileMenu) {
          document.querySelector('.nav-toggle').click();
        }
      }

      // Home/End keys for quick navigation
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  setupFocusManagement() {
    // Trap focus in mobile menu
    const mobileMenu = document.querySelector('.nav-menu');
    const menuItems = mobileMenu?.querySelectorAll('a, button');

    if (menuItems) {
      const firstItem = menuItems[0];
      const lastItem = menuItems[menuItems.length - 1];

      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstItem) {
            e.preventDefault();
            lastItem.focus();
          } else if (!e.shiftKey && document.activeElement === lastItem) {
            e.preventDefault();
            firstItem.focus();
          }
        }
      });
    }
  }

  setupReducedMotion() {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      document.documentElement.style.setProperty('--transition-normal', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
      document.documentElement.style.setProperty('--transition-bounce', '0ms');
    }
  }

  // Dynamic Content Updates
  updateDynamicContent() {
    this.updateCopyrightYear();
    this.setupExternalLinkIndicators();
  }

  updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  setupExternalLinkIndicators() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');

    externalLinks.forEach(link => {
      if (!link.querySelector('.external-icon')) {
        const icon = document.createElement('span');
        icon.className = 'external-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '↗';
        link.appendChild(icon);
      }

      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new VisionAlgorithms();
});

// Add CSS for animations and interactions
document.head.insertAdjacentHTML('beforeend', `
  <style>
    /* Fade-in animations */
    .fade-in {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-in-visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Ripple animation */
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    /* Mobile menu animations */
    .nav-menu {
      transition: all 0.3s ease;
    }

    .hamburger {
      --before-transform: none;
      --after-transform: none;
    }

    .hamburger::before {
      transform: var(--before-transform);
    }

    .hamburger::after {
      transform: var(--after-transform);
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Focus styles */
    .btn:focus-visible,
    .nav-link:focus-visible,
    .contact-link:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    /* Active navigation state */
    .nav-link.active {
      color: var(--color-text-primary);
    }

    .nav-link.active::after {
      width: 100%;
    }
  </style>
`);
