// TV Shows Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initializeCarousel();
    initializeFlipCards();
    initializeVideoModals();
    initializeTimelineAnimation();
    initializeGenreFilter();
    initializeTrendingSlider();
    
    // Simulate loading state
    simulateLoading();

    // Initialize TV show specific filter functionality
    initializeTvShowFilters();
    
    // Initialize modal forms with enhanced animations
    initializeModalForms();
    
    // Initialize hero section animations
    initializeHeroSection();
});

/**
 * Initialize the hero section animations and functionality
 */
function initializeHeroSection() {
    const heroVideo = document.getElementById('heroVideo');
    const heroSection = document.querySelector('.hero-section');
    
    if (heroVideo) {
        // Ensure video plays and loops correctly
        heroVideo.play().catch(e => {
            console.warn('Auto-play failed:', e);
            // Fallback to showing a poster image if video can't play
            if (heroSection) {
                heroSection.classList.add('video-fallback');
            }
        });
        
        // Add scroll animation to hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                if (scrollPosition < 500) {
                    // Create parallax effect
                    heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
                    // Adjust opacity for fade out effect
                    heroContent.style.opacity = 1 - (scrollPosition / 500);
                }
            });
        }
        
        // Add click events to hero buttons
        const primaryBtn = document.querySelector('.primary-hero-btn');
        const secondaryBtn = document.querySelector('.secondary-hero-btn');
        
        if (primaryBtn) {
            primaryBtn.addEventListener('click', () => {
                // Scroll to trending section
                const trendingSection = document.querySelector('.trending-now');
                if (trendingSection) {
                    trendingSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', () => {
                // Scroll to genre filter section
                const genreSection = document.querySelector('.genre-filters');
                if (genreSection) {
                    genreSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
}

/**
 * Initialize the trending movies carousel
 */
function initializeTrendingSlider() {
    const trendingSlides = document.getElementById('trendingSlides');
    const prevBtn = document.querySelector('.trending-prev');
    const nextBtn = document.querySelector('.trending-next');
    
    if (!trendingSlides || !prevBtn || !nextBtn) return;
    
    let slideWidth = 0;
    let slideCount = 0;
    let currentPosition = 0;
    let slidesPerView = 5;
    
    // Set up initial measurements
    function initSlider() {
        const firstSlide = trendingSlides.querySelector('.trending-slide');
        if (!firstSlide) return;
        
        slideWidth = firstSlide.offsetWidth + parseInt(window.getComputedStyle(firstSlide).marginRight || '0');
        slideCount = trendingSlides.querySelectorAll('.trending-slide').length;
        
        // Adjust slides per view based on screen width
        if (window.innerWidth < 768) {
            slidesPerView = 1;
        } else if (window.innerWidth < 992) {
            slidesPerView = 2;
        } else if (window.innerWidth < 1200) {
            slidesPerView = 3;
        } else {
            slidesPerView = 5;
        }
        
        // Reset position when resizing
        currentPosition = 0;
        trendingSlides.style.transform = `translateX(0)`;
    }
    
    // Go to next slide
    function nextSlide() {
        const maxPosition = slideCount - slidesPerView;
        if (currentPosition < maxPosition) {
            currentPosition++;
            trendingSlides.style.transform = `translateX(-${currentPosition * slideWidth}px)`;
        } else {
            // Loop back to start with animation
            trendingSlides.style.transition = 'none';
            currentPosition = 0;
            trendingSlides.style.transform = `translateX(0)`;
            setTimeout(() => {
                trendingSlides.style.transition = 'transform 0.5s ease';
            }, 10);
        }
    }
    
    // Go to previous slide
    function prevSlide() {
        if (currentPosition > 0) {
            currentPosition--;
            trendingSlides.style.transform = `translateX(-${currentPosition * slideWidth}px)`;
        } else {
            // Loop to the end with animation
            trendingSlides.style.transition = 'none';
            currentPosition = slideCount - slidesPerView;
            trendingSlides.style.transform = `translateX(-${currentPosition * slideWidth}px)`;
            setTimeout(() => {
                trendingSlides.style.transition = 'transform 0.5s ease';
            }, 10);
        }
    }
    
    // Initialize slider
    initSlider();
    
    // Add event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Handle responsiveness
    window.addEventListener('resize', initSlider);
    
    // Initialize hover effects for movie cards
    initializeMovieCardHoverEffects();
    
    // Auto-slide every 5 seconds
    setInterval(() => {
        nextSlide();
    }, 5000);
}

/**
 * Initialize enhanced hover effects for movie cards
 */
function initializeMovieCardHoverEffects() {
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        // Add mouse enter/leave event listeners for smoother transitions
        card.addEventListener('mouseenter', () => {
            card.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });
        
        // Add click event for watch buttons
        const watchBtn = card.querySelector('.watch-btn');
        if (watchBtn) {
            watchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = watchBtn.getAttribute('data-video');
                const title = watchBtn.getAttribute('data-title');
                
                if (videoId) {
                    openVideoModal(videoId, title);
                }
            });
        }
        
        // Add click event for add to list buttons
        const addToListBtn = card.querySelector('.add-to-list-btn');
        if (addToListBtn) {
            addToListBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = addToListBtn.getAttribute('data-id');
                const type = addToListBtn.getAttribute('data-type');
                const title = addToListBtn.getAttribute('data-title');
                const poster = addToListBtn.getAttribute('data-poster');
                
                // Check if user is logged in
                const isLoggedIn = localStorage.getItem('cineverse_current_user');
                
                if (isLoggedIn) {
                    addToWatchlist(id, type, title, poster);
                    showNotification(`Added ${title} to your watchlist`);
                } else {
                    // Open login modal if not logged in
                    openSignupModal();
                    showNotification('Please log in to add items to your watchlist', true);
                }
            });
        }
    });
}

/**
 * Open video modal with the given video ID
 */
function openVideoModal(videoId, title) {
    // Check if modal exists, create if it doesn't
    let videoModal = document.querySelector('.video-modal');
    
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.className = 'video-modal';
        videoModal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3 id="videoModalTitle"></h3>
                    <button class="video-modal-close">&times;</button>
                </div>
                <div class="video-container">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <iframe frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(videoModal);
        
        // Add close button functionality
        const closeBtn = videoModal.querySelector('.video-modal-close');
        closeBtn.addEventListener('click', closeVideoModal);
        
        // Close modal when clicking outside content
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }
    
    // Set video title
    const videoTitle = document.getElementById('videoModalTitle');
    if (videoTitle) {
        videoTitle.textContent = title || 'Watch Trailer';
    }
    
    // Set iframe source
    const iframe = videoModal.querySelector('iframe');
    const loadingSpinner = videoModal.querySelector('.loading-spinner');
    
    if (iframe && loadingSpinner) {
        loadingSpinner.style.display = 'flex';
        iframe.src = videoId;
        
        iframe.onload = () => {
            loadingSpinner.style.display = 'none';
        };
    }
    
    // Show modal with animation
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close video modal
 */
function closeVideoModal() {
    const videoModal = document.querySelector('.video-modal');
    if (videoModal) {
        videoModal.classList.remove('active');
        
        // Reset iframe src after animation
        setTimeout(() => {
            const iframe = videoModal.querySelector('iframe');
            if (iframe) {
                iframe.src = '';
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Add item to watchlist
 */
function addToWatchlist(id, type, title, poster) {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('cineverse_current_user'));
    
    if (currentUser) {
        // Get all users
        const users = JSON.parse(localStorage.getItem('cineverse_users')) || [];
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex !== -1) {
            // Create watchlist if it doesn't exist
            if (!users[userIndex].watchlist) {
                users[userIndex].watchlist = [];
            }
            
            // Check if item already exists in watchlist
            const exists = users[userIndex].watchlist.some(item => item.id === id && item.type === type);
            
            if (!exists) {
                // Add to watchlist
                users[userIndex].watchlist.push({
                    id,
                    type,
                    title,
                    poster,
                    addedAt: new Date().toISOString()
                });
                
                // Update localStorage
                localStorage.setItem('cineverse_users', JSON.stringify(users));
                localStorage.setItem('cineverse_current_user', JSON.stringify(users[userIndex]));
            }
        }
    }
}

/**
 * Display notification
 */
function showNotification(message, isError = false) {
    // Create notification container if it doesn't exist
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Update notification content
    notification.textContent = message;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Initialize the featured TV shows carousel
 */
function initializeCarousel() {
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentSlide = 0;
    
    // Show initial slide
    showSlide(currentSlide);
    
    // Show specific slide
    function showSlide(index) {
        carouselSlides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        carouselDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Navigate to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % carouselSlides.length;
        showSlide(currentSlide);
    }
    
    // Navigate to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
        showSlide(currentSlide);
    }
    
    // Set up event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    carouselDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentSlide = i;
            showSlide(currentSlide);
        });
    });
    
    // Auto-advance carousel every 5 seconds
    setInterval(nextSlide, 5000);
}

/**
 * Initialize flip card functionality
 */
function initializeFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card');
    
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

/**
 * Initialize video modal functionality for trailers
 */
function initializeVideoModals() {
    const trailerButtons = document.querySelectorAll('.btn-trailer');
    const videoModal = document.querySelector('.video-modal');
    const videoModalClose = document.querySelector('.video-modal-close');
    const videoContainer = document.querySelector('.video-container');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    trailerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get video ID from the button's data attribute
            const videoId = button.getAttribute('data-video-id') || 'dQw4w9WgXcQ'; // Fallback
            
            // Show modal and loading spinner
            videoModal.classList.add('active');
            loadingSpinner.style.display = 'block';
            
            // Create iframe for YouTube embed
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            // Once iframe loads, hide the spinner
            iframe.onload = () => {
                loadingSpinner.style.display = 'none';
            };
            
            // Clear any existing video and add the new one
            videoContainer.innerHTML = '';
            videoContainer.appendChild(iframe);
        });
    });
    
    // Close modal when clicking the close button
    if (videoModalClose) {
        videoModalClose.addEventListener('click', () => {
            videoModal.classList.remove('active');
            videoContainer.innerHTML = ''; // Remove the iframe
        });
    }
    
    // Close modal when clicking outside the video container
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.classList.remove('active');
                videoContainer.innerHTML = ''; // Remove the iframe
            }
        });
    }
}

/**
 * Initialize timeline section animation
 */
function initializeTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Use Intersection Observer to animate timeline items when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

/**
 * Initialize genre filtering functionality
 */
function initializeGenreFilter() {
    const filterButtons = document.querySelectorAll('.genre-filter button');
    const showCards = document.querySelectorAll('.show-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const genre = button.getAttribute('data-genre');
            
            // Toggle active class on buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter shows
            showCards.forEach(card => {
                const showGenres = card.getAttribute('data-genres').split(',');
                
                if (genre === 'all' || showGenres.includes(genre)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Initialize TV show specific filter functionality
 */
function initializeTvShowFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const movieCards = document.querySelectorAll('.movie-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filter = button.getAttribute('data-filter').toLowerCase();
            
            // Filter TV shows
            movieCards.forEach(card => {
                if (filter === 'all') {
                    // Show all cards
                    card.style.display = '';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 10);
                } else {
                    // Get genres for this card
                    const cardGenres = card.getAttribute('data-genre').toLowerCase();
                    
                    // Check if this card has the selected genre
                    if (cardGenres.includes(filter)) {
                        card.style.display = '';
                        setTimeout(() => {
                            card.style.opacity = '1';
                        }, 10);
                    } else {
                        // Hide this card
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

/**
 * Initialize modal forms and validation with enhanced animations
 */
function initializeModalForms() {
    // Modal elements
    const signupButton = document.getElementById('signupBtn');
    const loginButton = document.getElementById('loginBtn');
    const signupModal = document.getElementById('signupModal');
    const loginModal = document.getElementById('loginModal');
    const closeButtons = document.querySelectorAll('.close-btn');
    
    // Add modal classes if they don't exist
    if (signupModal && !signupModal.classList.contains('modal')) {
        signupModal.classList.add('modal');
    }
    
    if (loginModal && !loginModal.classList.contains('modal')) {
        loginModal.classList.add('modal');
    }
    
    // Open signup modal with animation
    function openSignupModal() {
        if (signupModal) {
            signupModal.style.display = 'flex';
            setTimeout(() => {
                signupModal.classList.add('show-modal');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Open login modal with animation
    function openLoginModal() {
        if (loginModal) {
            loginModal.style.display = 'flex';
            setTimeout(() => {
                loginModal.classList.add('show-modal');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close modal with animation
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show-modal');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 500);
        }
    }
    
    // Attach event listeners
    if (signupButton) {
        signupButton.addEventListener('click', openSignupModal);
    }
    
    if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }
    
    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Switch between modals
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(() => {
                openSignupModal();
            }, 500);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signupModal);
            setTimeout(() => {
                openLoginModal();
            }, 500);
        });
    }
    
    // Make openSignupModal available globally
    window.openSignupModal = openSignupModal;
    window.openLoginModal = openLoginModal;
}

/**
 * Simulate a loading state for the page
 */
function simulateLoading() {
    const heroSection = document.querySelector('.hero-section');
    const mainContent = document.querySelector('main');
    
    if (mainContent) {
        mainContent.style.opacity = '0';
        
        // Simulate a loading delay
        setTimeout(() => {
            if (heroSection) heroSection.classList.add('loaded');
            mainContent.style.opacity = '1';
            mainContent.style.transition = 'opacity 0.8s ease-in-out';
        }, 800);
    }
} 