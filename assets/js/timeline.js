/**
 * TIMELINE.JS
 * Interactive Career Timeline - Expand/Collapse with Keyboard Accessibility
 * Dr. M. R. Ravi, IAS Portfolio
 */

(function () {
    'use strict';

    // ========================================
    // Timeline Component
    // ========================================

    class Timeline {
        constructor(container) {
            this.container = container;
            this.items = container.querySelectorAll('.timeline-item');
            this.init();
        }

        init() {
            this.items.forEach((item, index) => {
                const header = item.querySelector('.timeline-header');
                const content = item.querySelector('.timeline-content');

                if (!header || !content) return;

                // Set up ARIA attributes
                const headerId = `timeline-header-${index}`;
                const contentId = `timeline-content-${index}`;

                header.setAttribute('id', headerId);
                header.setAttribute('aria-controls', contentId);
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');

                content.setAttribute('id', contentId);
                content.setAttribute('aria-labelledby', headerId);
                content.setAttribute('role', 'region');
                content.setAttribute('aria-hidden', 'true');

                // Click handler
                header.addEventListener('click', () => this.toggle(item));

                // Keyboard handler
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle(item);
                    }
                });
            });
        }

        toggle(item) {
            const header = item.querySelector('.timeline-header');
            const content = item.querySelector('.timeline-content');

            if (!header || !content) return;

            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Toggle state
            header.setAttribute('aria-expanded', !isExpanded);
            content.setAttribute('aria-hidden', isExpanded);
            content.classList.toggle('active');

            // Announce change to screen readers
            this.announceChange(item, !isExpanded);
        }

        expand(item) {
            const header = item.querySelector('.timeline-header');
            const content = item.querySelector('.timeline-content');

            if (!header || !content) return;

            header.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');
            content.classList.add('active');
        }

        collapse(item) {
            const header = item.querySelector('.timeline-header');
            const content = item.querySelector('.timeline-content');

            if (!header || !content) return;

            header.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
            content.classList.remove('active');
        }

        expandAll() {
            this.items.forEach(item => this.expand(item));
        }

        collapseAll() {
            this.items.forEach(item => this.collapse(item));
        }

        announceChange(item, isExpanded) {
            // Create a live region for screen readers
            let liveRegion = document.getElementById('timeline-live-region');

            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'timeline-live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }

            const title = item.querySelector('.timeline-title');
            const titleText = title ? title.textContent : 'Item';
            const state = isExpanded ? 'expanded' : 'collapsed';

            liveRegion.textContent = `${titleText} ${state}`;
        }
    }

    // ========================================
    // Initialize Timelines
    // ========================================

    function initTimelines() {
        const timelines = document.querySelectorAll('.timeline');

        timelines.forEach(timeline => {
            new Timeline(timeline);
        });

        // Optional: Add expand/collapse all buttons if they exist
        const expandAllBtn = document.querySelector('[data-timeline-expand-all]');
        const collapseAllBtn = document.querySelector('[data-timeline-collapse-all]');

        if (expandAllBtn || collapseAllBtn) {
            const timelineInstance = timelines.length > 0 ? new Timeline(timelines[0]) : null;

            if (expandAllBtn && timelineInstance) {
                expandAllBtn.addEventListener('click', () => {
                    timelines.forEach(t => {
                        const instance = new Timeline(t);
                        instance.expandAll();
                    });
                });
            }

            if (collapseAllBtn && timelineInstance) {
                collapseAllBtn.addEventListener('click', () => {
                    timelines.forEach(t => {
                        const instance = new Timeline(t);
                        instance.collapseAll();
                    });
                });
            }
        }
    }

    // ========================================
    // Initialize on DOM Ready
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTimelines);
    } else {
        initTimelines();
    }

})();
