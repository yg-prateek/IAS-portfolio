/**
 * MAIN.JS
 * Core site functionality - Navigation, Mobile Menu, Smooth Scroll, Active States
 * Dr. M. R. Ravi, IAS Portfolio
 */

(function () {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // ========================================
    // Mobile Navigation Toggle
    // ========================================

    function initMobileNav() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', toggleNav);

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeNav();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeNav();
            }
        });
    }

    function toggleNav() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeNav() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Active Navigation State
    // ========================================

    function setActiveNavLink() {
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href) {
                // Check if current path matches link href
                if (currentPath.endsWith(href) ||
                    (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/en/') || currentPath.endsWith('/kn/')))) {
                    link.classList.add('active');
                }
            }
        });
    }

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, targetId);

                    // Focus the target for accessibility
                    targetElement.focus();
                }
            });
        });
    }

    // ========================================
    // Header Scroll Effect
    // ========================================

    function initHeaderScroll() {
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    handleHeaderScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        function handleHeaderScroll() {
            const currentScrollY = window.scrollY;

            // Add shadow when scrolled
            if (currentScrollY > 10) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }

            lastScrollY = currentScrollY;
        }
    }

    // ========================================
    // Skip Link Functionality
    // ========================================

    function initSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        const mainContent = document.querySelector('#main-content') || document.querySelector('main');

        if (skipLink && mainContent) {
            skipLink.addEventListener('click', function (e) {
                e.preventDefault();
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // ========================================
    // Lazy Loading Images
    // ========================================

    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            lazyImages.forEach(function (img) {
                imageObserver.observe(img);
            });
        }
    }

    // ========================================
    // Scroll Reveal Animation
    // ========================================

    function initScrollReveal() {
        // Elements to animate on scroll
        const revealElements = document.querySelectorAll(
            '.card, .impact-card, .book-card, .section-header, .timeline-item, ' +
            '.gallery-item, .about-content, .hero-stat, .award-card, .feature-card, ' +
            '.stat-item, .about-preview, .quote-section, .cta-banner, ' +
            '[data-reveal], .reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade'
        );

        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            revealElements.forEach(el => el.classList.add('revealed'));
            return;
        }

        const revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.revealDelay || 0;

                    setTimeout(function () {
                        el.classList.add('revealed');
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.15
        });

        revealElements.forEach(function (el, index) {
            // Add base reveal class if not already present
            if (!el.classList.contains('reveal') &&
                !el.classList.contains('reveal-left') &&
                !el.classList.contains('reveal-right') &&
                !el.classList.contains('reveal-scale') &&
                !el.classList.contains('reveal-fade')) {
                el.classList.add('reveal');
            }

            // Stagger animation for grid items
            const parent = el.closest('.grid, .books-grid, .gallery-grid, .hero-stats, .stats-grid, .highlight-grid');
            if (parent) {
                const siblings = Array.from(parent.children);
                const siblingIndex = siblings.indexOf(el);
                el.dataset.revealDelay = siblingIndex * 100;
            }

            revealObserver.observe(el);
        });
    }

    // ========================================
    // Counter Animation for Stats
    // ========================================

    function initCounterAnimation() {
        const counters = document.querySelectorAll('.hero-stat-number, .stat-number');

        if (!counters.length) return;

        const counterObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    animateCounter(counter);
                    observer.unobserve(counter);
                }
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(element) {
        const text = element.textContent;
        const match = text.match(/(\d+)/);

        if (!match) return;

        const target = parseInt(match[1]);
        const suffix = text.replace(/\d+/, '');
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;

        function updateCounter() {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // ========================================
    // Initialize
    // ========================================

    function init() {
        initMobileNav();
        setActiveNavLink();
        initSmoothScroll();
        initHeaderScroll();
        initSkipLink();
        initLazyLoading();
        initScrollReveal();
        initCounterAnimation();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
