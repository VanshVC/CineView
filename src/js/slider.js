// TV Shows Page Slider Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Featured Content Carousel
    initFeaturedCarousel();
    
    // Genre Filters
    initGenreFilters();
    
    // Timeline Scrolling
    initTimelineNavigation();
    
    // Video Modal
    initVideoModal();
    
    // Movie Slider Navigation
    initMovieSliders();
    
    // Movie Details Modal
    initMovieDetailsModal();
    
    // Flip Cards (no JS needed, CSS handles the effect)
});

// Featured Carousel Functionality
function initFeaturedCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let slideInterval;
    
    // Initialize first slide
    if (slides.length > 0) {
        slides[0].classList.add('active');
        if (indicators.length > 0) {
            indicators[0].classList.add('active');
        }
        
        // Auto advance slides
        startSlideInterval();
        
        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                goToSlide(currentSlide - 1);
                startSlideInterval();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                goToSlide(currentSlide + 1);
                startSlideInterval();
            });
        }
        
        // Indicator dots
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                clearInterval(slideInterval);
                goToSlide(index);
                startSlideInterval();
            });
        });
    }
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        if (indicators.length > 0) {
            indicators[currentSlide].classList.remove('active');
        }
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (indicators.length > 0) {
            indicators[currentSlide].classList.add('active');
        }
    }
    
    function startSlideInterval() {
        slideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000); // Change slide every 5 seconds
    }
    
    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            startSlideInterval();
        });
    }
}

// Genre Filter Functionality
function initGenreFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const movieCards = document.querySelectorAll('.movie-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            
            // Show/hide movie cards based on filter
            movieCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    if (card.getAttribute('data-genre').includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

// Timeline Navigation
function initTimelineNavigation() {
    const timeline = document.querySelector('.timeline');
    const prevBtn = document.querySelector('.timeline-prev');
    const nextBtn = document.querySelector('.timeline-next');
    
    if (timeline && prevBtn && nextBtn) {
        const scrollAmount = 400; // Scroll amount in pixels
        
        prevBtn.addEventListener('click', () => {
            timeline.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', () => {
            timeline.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
}

// Video Modal Functionality
function initVideoModal() {
    const modal = document.querySelector('.video-modal');
    const closeBtn = document.querySelector('.close-video-btn');
    const videoPlayer = document.getElementById('videoPlayer');
    const playButtons = document.querySelectorAll('.play-btn, .watch-btn, .flip-watch-btn');
    
    if (modal && closeBtn && videoPlayer && playButtons.length > 0) {
        // Open modal when play button is clicked
        playButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get video source from data attribute (if available)
                const videoSrc = this.getAttribute('data-video') || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
                
                // Get video title (if available)
                const videoTitle = this.getAttribute('data-title') || 'Video Player';
                document.querySelector('.video-player-header h3').textContent = videoTitle;
                
                // Show loading spinner
                document.querySelector('.video-loading').style.display = 'flex';
                
                // Set video source
                if (videoSrc.includes('youtube')) {
                    // If YouTube video, add autoplay parameter
                    videoPlayer.src = videoSrc + '?autoplay=1&mute=0';
                } else {
                    videoPlayer.src = videoSrc;
                }
                
                // Show modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
                // Hide loading spinner when video loads
                videoPlayer.onload = function() {
                    document.querySelector('.video-loading').style.display = 'none';
                };
                
                // Fallback if onload doesn't trigger
                setTimeout(() => {
                    document.querySelector('.video-loading').style.display = 'none';
                }, 2000);
            });
        });
        
        // Close modal when close button is clicked
        closeBtn.addEventListener('click', () => {
            closeVideoModal();
        });
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeVideoModal();
            }
        });
        
        // Close modal when ESC key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeVideoModal();
            }
        });
        
        function closeVideoModal() {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            videoPlayer.src = ''; // Stop video playback
        }
    }
}

// Handle movie card hover effects
document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const details = this.querySelector('.movie-details');
        if (details) {
            details.style.transform = 'translateY(0)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const details = this.querySelector('.movie-details');
        if (details) {
            details.style.transform = 'translateY(70%)';
        }
    });
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imgOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 200px 0px"
    };
    
    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                
                observer.unobserve(img);
            }
        });
    }, imgOptions);
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imgObserver.observe(img);
    });
} 

/**
 * Initialize movie sliders with arrow navigation
 */
function initMovieSliders() {
    // Initialize carousel style sliders
    const carouselSliders = document.querySelectorAll('.movies-slider.carousel-style');
    
    carouselSliders.forEach(slider => {
        const sliderWrapper = slider.closest('.slider-wrapper');
        if (!sliderWrapper) return;
        
        const prevArrow = sliderWrapper.querySelector('.prev-arrow');
        const nextArrow = sliderWrapper.querySelector('.next-arrow');
        
        if (prevArrow && nextArrow) {
            // Calculate scroll amount based on card width and gap
            const cardWidth = 280; // Width of a movie card in pixels
            const gap = 24; // Gap between cards in pixels
            const scrollAmount = (cardWidth + gap) * 2; // Scroll by 2 cards at a time
            
            // Add click event for previous arrow
            prevArrow.addEventListener('click', () => {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
            
            // Add click event for next arrow
            nextArrow.addEventListener('click', () => {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
            
            // Show arrows on desktop
            if (window.innerWidth > 768) {
                prevArrow.style.display = 'flex';
                nextArrow.style.display = 'flex';
            }
        }
    });
    
    // Initialize snap scroll style sliders (TV Shows)
    const snapScrollSliders = document.querySelectorAll('.movies-slider.snap-scroll-style');
    
    snapScrollSliders.forEach(slider => {
        const sliderWrapper = slider.closest('.slider-wrapper');
        if (!sliderWrapper) return;
        
        const prevArrow = sliderWrapper.querySelector('.prev-arrow');
        const nextArrow = sliderWrapper.querySelector('.next-arrow');
        const paginationDots = slider.closest('section').querySelectorAll('.pagination-dot');
        
        if (prevArrow && nextArrow) {
            // Calculate scroll amount based on card width and gap
            const cardWidth = 280; // Width of a movie card in pixels
            const gap = 24; // Gap between cards in pixels
            const scrollAmount = (cardWidth + gap) * 3; // Scroll by 3 cards at a time
            
            // Add click event for previous arrow
            prevArrow.addEventListener('click', () => {
                console.log('TV Shows prev arrow clicked');
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
                updatePaginationDots(slider, paginationDots);
            });
            
            // Add click event for next arrow
            nextArrow.addEventListener('click', () => {
                console.log('TV Shows next arrow clicked');
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
                updatePaginationDots(slider, paginationDots);
            });
            
            // Show arrows on desktop
            if (window.innerWidth > 768) {
                prevArrow.style.display = 'flex';
                nextArrow.style.display = 'flex';
            }
            
            // Add click events for pagination dots
            if (paginationDots.length > 0) {
                paginationDots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        const scrollPosition = index * scrollAmount;
                        slider.scrollTo({
                            left: scrollPosition,
                            behavior: 'smooth'
                        });
                        
                        // Update active dot
                        paginationDots.forEach(d => d.classList.remove('active'));
                        dot.classList.add('active');
                    });
                });
                
                // Update pagination dots on scroll
                slider.addEventListener('scroll', () => {
                    updatePaginationDots(slider, paginationDots);
                });
            }
        }
    });
    
    // Function to update pagination dots based on scroll position
    function updatePaginationDots(slider, dots) {
        if (!dots || dots.length === 0) return;
        
        const scrollPosition = slider.scrollLeft;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const scrollPercentage = scrollPosition / maxScroll;
        const dotIndex = Math.min(
            Math.floor(scrollPercentage * dots.length),
            dots.length - 1
        );
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === dotIndex);
        });
    }
}

/**
 * Initialize movie details modal functionality
 */
function initMovieDetailsModal() {
    // Get the modal
    const modal = document.getElementById('movieDetailsModal');
    if (!modal) {
        console.error('Movie details modal not found');
        return;
    }
    
    const modalTitle = document.getElementById('modalMovieTitle');
    const modalDirector = document.getElementById('modalDirector');
    const modalOverview = document.getElementById('modalOverview');
    const closeBtn = modal.querySelector('.close-modal');
    
    if (!modalTitle || !modalDirector || !modalOverview) {
        console.error('Modal content elements not found');
        return;
    }
    
    // Get all info buttons
    const infoButtons = document.querySelectorAll('.info-btn');
    
    // Add click event to all info buttons
    infoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get movie data from data attributes
            const movieTitle = this.closest('.movie-card').querySelector('h3').textContent;
            const director = this.getAttribute('data-director');
            const overview = this.getAttribute('data-overview');
            
            console.log('Movie details:', { movieTitle, director, overview });
            
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
            closeMovieDetailsModal();
        });
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeMovieDetailsModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeMovieDetailsModal();
        }
    });
    
    // Function to close the modal
    function closeMovieDetailsModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}