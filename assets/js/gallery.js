/**
 * GALLERY.JS
 * Image Gallery with Lightbox - Keyboard Navigation & Accessibility
 * Dr. M. R. Ravi, IAS Portfolio
 */

(function () {
    'use strict';

    // ========================================
    // Lightbox Component
    // ========================================

    class Lightbox {
        constructor() {
            this.images = [];
            this.currentIndex = 0;
            this.isOpen = false;
            this.focusedElementBeforeOpen = null;

            this.createLightbox();
            this.bindEvents();
        }

        createLightbox() {
            // Create lightbox HTML
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.id = 'lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Image lightbox');

            lightbox.innerHTML = `
                <button class="lightbox-close" aria-label="Close lightbox">
                    <span aria-hidden="true">&times;</span>
                </button>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
                    <span aria-hidden="true">&#8249;</span>
                </button>
                <div class="lightbox-content">
                    <img class="lightbox-image" src="" alt="" />
                    <p class="lightbox-caption sr-only"></p>
                </div>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">
                    <span aria-hidden="true">&#8250;</span>
                </button>
            `;

            document.body.appendChild(lightbox);

            // Store references
            this.lightbox = lightbox;
            this.lightboxImage = lightbox.querySelector('.lightbox-image');
            this.lightboxCaption = lightbox.querySelector('.lightbox-caption');
            this.closeBtn = lightbox.querySelector('.lightbox-close');
            this.prevBtn = lightbox.querySelector('.lightbox-prev');
            this.nextBtn = lightbox.querySelector('.lightbox-next');

            // Get all focusable elements in lightbox
            this.focusableElements = lightbox.querySelectorAll('button');
        }

        bindEvents() {
            // Close button
            this.closeBtn.addEventListener('click', () => this.close());

            // Navigation buttons
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());

            // Click outside to close
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.close();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        handleKeydown(e) {
            if (!this.isOpen) return;

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Tab':
                    this.trapFocus(e);
                    break;
            }
        }

        trapFocus(e) {
            const firstFocusable = this.focusableElements[0];
            const lastFocusable = this.focusableElements[this.focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }

        open(images, startIndex = 0) {
            this.images = images;
            this.currentIndex = startIndex;

            // Store current focus
            this.focusedElementBeforeOpen = document.activeElement;

            // Update image
            this.updateImage();

            // Show lightbox
            this.lightbox.classList.add('active');
            this.isOpen = true;

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Focus close button
            this.closeBtn.focus();

            // Update nav visibility
            this.updateNavVisibility();
        }

        close() {
            this.lightbox.classList.remove('active');
            this.isOpen = false;

            // Restore body scroll
            document.body.style.overflow = '';

            // Restore focus
            if (this.focusedElementBeforeOpen) {
                this.focusedElementBeforeOpen.focus();
            }
        }

        prev() {
            if (this.images.length <= 1) return;

            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.updateImage();
        }

        next() {
            if (this.images.length <= 1) return;

            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.updateImage();
        }

        updateImage() {
            const image = this.images[this.currentIndex];

            if (!image) return;

            this.lightboxImage.src = image.src;
            this.lightboxImage.alt = image.alt || `Image ${this.currentIndex + 1} of ${this.images.length}`;
            this.lightboxCaption.textContent = image.alt || '';

            // Announce to screen readers
            this.announce(`Image ${this.currentIndex + 1} of ${this.images.length}: ${image.alt || 'No description'}`);
        }

        updateNavVisibility() {
            // Hide nav buttons if only one image
            const hidden = this.images.length <= 1;
            this.prevBtn.style.display = hidden ? 'none' : 'flex';
            this.nextBtn.style.display = hidden ? 'none' : 'flex';
        }

        announce(message) {
            let liveRegion = document.getElementById('lightbox-live-region');

            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'lightbox-live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }

            liveRegion.textContent = message;
        }
    }

    // ========================================
    // Gallery Initialization
    // ========================================

    function initGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');

        if (!galleryGrid) return;

        const lightbox = new Lightbox();
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item');

        // Collect all images
        const images = [];

        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');

            if (!img) return;

            images.push({
                src: img.dataset.fullsize || img.src,
                alt: img.alt
            });

            // Make item focusable
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View ${img.alt || 'image'} in lightbox`);

            // Click handler
            item.addEventListener('click', () => {
                lightbox.open(images, index);
            });

            // Keyboard handler
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    lightbox.open(images, index);
                }
            });
        });
    }

    // ========================================
    // Gallery Filters (Optional)
    // ========================================

    function initGalleryFilters() {
        const filterButtons = document.querySelectorAll('.gallery-filter');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;

                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter items
                galleryItems.forEach(item => {
                    const category = item.dataset.category;

                    if (filter === 'all' || category === filter) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // Initialize on DOM Ready
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initGallery();
            initGalleryFilters();
        });
    } else {
        initGallery();
        initGalleryFilters();
    }

})();
