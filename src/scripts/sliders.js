/**
 * CineView Advanced Sliders
 * Handles all slider functionality and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Carousel Slider with Arrow Controls
    initCarouselSlider();
    
    // Initialize Snap Scroll Slider with Pagination
    initSnapScrollSlider();
    
    // Initialize Featured Items
    initFeaturedItems();
    
    // Initialize Default Movie Sliders
    initMovieSliders();
});

/**
 * Initialize Carousel Slider with Arrow Controls
 */
function initCarouselSlider() {
    const carouselSlider = document.querySelector('.carousel-style');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    if (!carouselSlider || !prevArrow || !nextArrow) return;
    
    // Calculate scroll amount (width of one card + gap)
    const scrollAmount = 280 + 24; // card width + gap
    
    // Add click event to next arrow
    nextArrow.addEventListener('click', () => {
        carouselSlider.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Add click event to previous arrow
    prevArrow.addEventListener('click', () => {
        carouselSlider.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Show/hide arrows based on scroll position
    carouselSlider.addEventListener('scroll', () => {
        // Check if at the start
        if (carouselSlider.scrollLeft <= 10) {
            prevArrow.classList.add('disabled');
        } else {
            prevArrow.classList.remove('disabled');
        }
        
        // Check if at the end
        const maxScrollLeft = carouselSlider.scrollWidth - carouselSlider.clientWidth - 10;
        if (carouselSlider.scrollLeft >= maxScrollLeft) {
            nextArrow.classList.add('disabled');
        } else {
            nextArrow.classList.remove('disabled');
        }
    });
    
    // Trigger scroll event to set initial arrow states
    carouselSlider.dispatchEvent(new Event('scroll'));
    
    // Add hover effect to movie cards
    const movieCards = carouselSlider.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            movieCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

/**
 * Initialize Snap Scroll Slider with Pagination
 */
function initSnapScrollSlider() {
    const snapScrollSlider = document.querySelector('.snap-scroll-style');
    const paginationDots = document.querySelectorAll('.pagination-dot');
    
    if (!snapScrollSlider || !paginationDots.length) return;
    
    // Update active dot based on scroll position
    snapScrollSlider.addEventListener('scroll', () => {
        const scrollPosition = snapScrollSlider.scrollLeft;
        const cardWidth = 280 + 24; // card width + gap
        const visibleCards = Math.round(snapScrollSlider.clientWidth / cardWidth);
        const totalScrollWidth = snapScrollSlider.scrollWidth - snapScrollSlider.clientWidth;
        
        // Calculate which section is visible
        const scrollPercentage = scrollPosition / totalScrollWidth;
        const totalSections = paginationDots.length;
        const activeSection = Math.min(
            Math.floor(scrollPercentage * totalSections),
            totalSections - 1
        );
        
        // Update active dot
        paginationDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeSection);
        });
    });
    
    // Add click event to pagination dots
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const cardWidth = 280 + 24; // card width + gap
            const totalCards = snapScrollSlider.querySelectorAll('.movie-card').length;
            const totalSections = paginationDots.length;
            const cardsPerSection = Math.ceil(totalCards / totalSections);
            
            // Calculate scroll position
            const scrollTo = index * cardsPerSection * cardWidth;
            
            // Scroll to position
            snapScrollSlider.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        });
    });
    
    // Trigger scroll event to set initial dot state
    snapScrollSlider.dispatchEvent(new Event('scroll'));
}

/**
 * Initialize Featured Items
 */
function initFeaturedItems() {
    const featuredItems = document.querySelectorAll('.featured-item');
    
    if (!featuredItems.length) return;
    
    // Add click event to watch buttons
    featuredItems.forEach(item => {
        const watchBtn = item.querySelector('.watch-btn');
        const trailerBtn = item.querySelector('.trailer-btn');
        const title = item.querySelector('h3').textContent;
        
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                console.log(`Playing: ${title}`);
                showNotification(`Now playing: ${title}`);
            });
        }
        
        if (trailerBtn) {
            trailerBtn.addEventListener('click', () => {
                console.log(`Showing trailer for: ${title}`);
                showNotification(`Watching trailer: ${title}`);
            });
        }
    });
}

/**
 * Generic Movie Sliders (Trending & TV Shows)
 */
function initMovieSliders() {
    const sliders = document.querySelectorAll('.movies-slider');
    
    sliders.forEach(slider => {
        // Add mouse wheel scrolling
        slider.addEventListener('wheel', (e) => {
            e.preventDefault();
            slider.scrollBy({
                left: e.deltaY > 0 ? 100 : -100,
                behavior: 'smooth'
            });
        });
        
        // Add touch navigation
        let isDown = false;
        let startX;
        let scrollLeft;
        
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    });
    
    // Add hover effects for movie cards
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add a slight delay to make hovering more intentional
            setTimeout(() => {
                card.classList.add('hovered');
            }, 50);
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });
    });
}

/**
 * Grid Showcase Interactions
 */
document.querySelectorAll('.featured-item').forEach(item => {
    // Add click handler to grid items
    item.addEventListener('click', (e) => {
        // Only handle click if it's on the grid item or overlay (not the button)
        if (!e.target.closest('.watch-btn') && !e.target.closest('.trailer-btn')) {
            const watchBtn = item.querySelector('.watch-btn');
            if (watchBtn) {
                // Simulate button click for better UX
                watchBtn.classList.add('pulse');
                setTimeout(() => {
                    watchBtn.classList.remove('pulse');
                }, 300);
            }
        }
    });
});

/**
 * Show notification
 */
function showNotification(message) {
    // Check if notification element exists
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // Create notification element
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <p>${message}</p>
            <span class="notification-close"><i class="fas fa-times"></i></span>
        `;
        document.body.appendChild(notification);
    } else {
        // Update message
        const notificationMessage = notification.querySelector('p');
        if (notificationMessage) {
            notificationMessage.textContent = message;
        }
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }, 100);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
        });
    }
}

// Add to watchlist functionality
document.addEventListener('click', (e) => {
    if (e.target.closest('.add-list-btn')) {
        const card = e.target.closest('.movie-card') || e.target.closest('.featured-item');
        if (card) {
            const title = card.querySelector('h3').textContent;
            showNotification(`Added "${title}" to your watchlist`);
        }
    }
});

// Intersection Observer for lazy loading sections
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

sections.forEach(section => {
    sectionObserver.observe(section);
}); 