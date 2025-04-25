/**
 * 3D Carousel for Movies Page
 * A unique 3D carousel that displays movies in a circular arrangement
 */

document.addEventListener('DOMContentLoaded', function() {
    initCarousel3D();
});

/**
 * Initialize the 3D Carousel
 */
function initCarousel3D() {
    const carousel = document.querySelector('.carousel3d');
    if (!carousel) return;
    
    const items = carousel.querySelectorAll('.carousel3d-item');
    const prevBtn = document.querySelector('.carousel3d-prev');
    const nextBtn = document.querySelector('.carousel3d-next');
    
    let currentIndex = 0;
    const totalItems = items.length;
    const radius = 300; // Distance from center
    const theta = 2 * Math.PI / totalItems; // Angle between items
    
    // Set animation delay for entrance effect
    items.forEach((item, index) => {
        item.style.setProperty('--index', index);
    });
    
    // Initial arrangement
    arrangeItems();
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            arrangeItems();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalItems;
            arrangeItems();
        });
    }
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            currentIndex = (currentIndex + 1) % totalItems;
            arrangeItems();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            arrangeItems();
        }
    }
    
    // Click on item to bring it to front
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index !== currentIndex) {
                currentIndex = index;
                arrangeItems();
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            arrangeItems();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % totalItems;
            arrangeItems();
        }
    });
    
    // Auto rotation (optional)
    let autoRotate = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        arrangeItems();
    }, 5000);
    
    // Pause auto rotation on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoRotate);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            arrangeItems();
        }, 5000);
    });
    
    /**
     * Arrange items in a 3D circular pattern
     */
    function arrangeItems() {
        items.forEach((item, index) => {
            // Remove active class from all items
            item.classList.remove('active');
            
            // Calculate the angle for this item
            const angle = theta * (index - currentIndex);
            
            // Calculate 3D position
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            
            // Apply transformations
            item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${-angle}rad)`;
            
            // Scale and opacity based on z position
            const scale = Math.max(0.6, (1000 + z) / 1000);
            const opacity = Math.max(0.4, (1000 + z) / 1000);
            item.style.scale = scale;
            item.style.opacity = opacity;
            
            // Set z-index based on distance
            item.style.zIndex = Math.floor(opacity * 10);
            
            // Add active class to current item
            if (index === currentIndex) {
                item.classList.add('active');
                item.style.zIndex = 10;
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        arrangeItems();
    });
}

// Initialize movie details modal functionality for carousel items
document.addEventListener('DOMContentLoaded', function() {
    const infoButtons = document.querySelectorAll('.carousel3d-buttons .info-btn');
    const modal = document.getElementById('movieDetailsModal');
    
    if (!modal || !infoButtons.length) return;
    
    const modalTitle = document.getElementById('modalMovieTitle');
    const modalDirector = document.getElementById('modalDirector');
    const modalOverview = document.getElementById('modalOverview');
    const closeBtn = modal.querySelector('.close-modal');
    
    infoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get movie data from data attributes
            const movieTitle = this.closest('.carousel3d-card').querySelector('h3').textContent;
            const director = this.getAttribute('data-director');
            const overview = this.getAttribute('data-overview');
            
            // Populate modal with movie data
            modalTitle.textContent = movieTitle;
            modalDirector.innerHTML = '<strong>Director:</strong> ' + director;
            modalOverview.textContent = overview;
            
            // Display modal with animation
            modal.style.display = 'flex';
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeMovieModal();
        });
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeMovieModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeMovieModal();
        }
    });
    
    // Function to close the modal
    function closeMovieModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
});