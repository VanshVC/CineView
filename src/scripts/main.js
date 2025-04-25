// Initialize API Service
const api = new ApiService();

// Initialize User Manager
const userManager = window.userManager || new UserManager();

// DOM Elements
const header = document.querySelector('header');
const signupBtn = document.querySelector('.signup-btn');
const loginBtn = document.querySelector('.login-btn');
const signupModal = document.getElementById('signupModal');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close-btn');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const filterBtns = document.querySelectorAll('.filter-btn');
const movieCards = document.querySelectorAll('.movie-card');
const trendingSection = document.querySelector('.trending .movies-slider');
const tvShowsSection = document.querySelector('.tv-shows .movies-slider');
const featuredSection = document.querySelector('.featured-grid');
const continueWatchingSection = document.createElement('section');
continueWatchingSection.className = 'continue-watching slide-up';
continueWatchingSection.innerHTML = `
    <h2 class="section-title">Continue Watching</h2>
    <div class="movies-slider"></div>
`;

// Insert Continue Watching section after hero section if user is logged in
if (userManager.currentUser) {
    const heroSection = document.querySelector('.hero');
    if (heroSection && heroSection.nextElementSibling) {
        heroSection.parentNode.insertBefore(continueWatchingSection, heroSection.nextElementSibling);
    }
}

console.log('DOM Elements initialized:', {
    trendingSection: !!trendingSection,
    tvShowsSection: !!tvShowsSection,
    featuredSection: !!featuredSection,
    continueWatchingSection: !!continueWatchingSection
});

// Initialize Video Player
let activePlayer = null;

// Load Initial Content
async function initializeContent() {
    console.log('Initializing content...');
    try {
        // Check if user is logged in
        if (userManager.currentUser) {
            // Load continue watching
            console.log('Loading continue watching...');
            const continueWatchingItems = userManager.getContinueWatching();
            if (continueWatchingItems.length > 0) {
                const continueWatchingSlider = continueWatchingSection.querySelector('.movies-slider');
                updateContinueWatchingSlider(continueWatchingSlider, continueWatchingItems);
            } else {
                // Hide section if empty
                continueWatchingSection.style.display = 'none';
            }
            
            // Load personalized recommendations based on watch history
            console.log('Loading personalized recommendations...');
            await loadPersonalizedRecommendations();
        }
        
        // Load trending movies
        console.log('Fetching trending movies...');
        const trendingMovies = await api.getTrending('movie', 'week');
        console.log('Trending movies received:', trendingMovies);
        updateMovieSlider(trendingSection, trendingMovies);
        
        // Load popular TV shows
        console.log('Fetching popular TV shows...');
        const popularTVShows = await api.getTrending('tv', 'week');
        console.log('Popular TV shows received:', popularTVShows);
        updateMovieSlider(tvShowsSection, popularTVShows);
        
        // Load featured content
        console.log('Fetching featured content...');
        const featuredContent = await api.getTrending('all', 'day');
        console.log('Featured content received:', featuredContent);
        updateFeaturedContent(featuredContent.slice(0, 3));
        
        // Initialize genre filters
        console.log('Initializing genre filters...');
        await initializeGenreFilters();
        
        console.log('Content initialization completed successfully');
    } catch (error) {
        console.error('Error loading content:', error);
        showNotification('Error loading content. Please try again later.', true);
    }
}

// Load personalized recommendations based on watch history
async function loadPersonalizedRecommendations() {
    if (!userManager.currentUser) return;
    
    try {
        // Get watch history
        const watchHistory = userManager.getWatchHistory();
        
        // If no watch history, return
        if (watchHistory.length === 0) return;
        
        // Get most recently watched item
        const recentItem = watchHistory[0];
        
        // Get recommendations based on recent item
        const recommendations = await api.getDetails(recentItem.id, recentItem.type)
            .then(details => details.recommendations || []);
        
        // Create recommendations section if it doesn't exist
        let recommendationsSection = document.querySelector('.recommendations');
        if (!recommendationsSection) {
            recommendationsSection = document.createElement('section');
            recommendationsSection.className = 'recommendations slide-up';
            recommendationsSection.innerHTML = `
                <h2 class="section-title">Recommended For You</h2>
                <div class="movies-slider"></div>
            `;
            
            // Insert after trending section
            const trendingParent = trendingSection.parentNode;
            trendingParent.parentNode.insertBefore(recommendationsSection, trendingParent.nextElementSibling);
        }
        
        // Update recommendations slider
        const recommendationsSlider = recommendationsSection.querySelector('.movies-slider');
        updateMovieSlider(recommendationsSlider, recommendations);
    } catch (error) {
        console.error('Error loading personalized recommendations:', error);
    }
}

// Update Movie Slider
function updateMovieSlider(container, items) {
    console.log('Updating movie slider:', { container: !!container, itemCount: items?.length });
    if (!container) {
        console.error('Container not found for movie slider');
        return;
    }
    
    try {
        container.innerHTML = items.map(item => `
            <div class="movie-card gradient-border" data-id="${item.id}" data-type="${item.type}" data-genre="${item.genreIds.join(' ')}">
                <div class="movie-poster">
                    <img src="${item.posterPath}" alt="${item.title}">
                    <div class="movie-details">
                        <h3>${item.title}</h3>
                        <div class="movie-meta">
                            <span class="movie-rating"><i class="fas fa-star"></i> ${item.rating.toFixed(1)}</span>
                            <span class="movie-year">${new Date(item.releaseDate).getFullYear()}</span>
                        </div>
                        <p class="movie-desc">${item.overview.slice(0, 100)}...</p>
                        <button class="watch-btn" onclick="playContent('${item.id}', '${item.type}')">
                            <i class="fas fa-play"></i> Watch Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Movie slider updated successfully');
        
        // Reinitialize hover effects
        initializeHoverEffects();
    } catch (error) {
        console.error('Error updating movie slider:', error);
        showNotification('Error updating content. Please refresh the page.', true);
    }
}

// Update Featured Content
function updateFeaturedContent(items) {
    if (!featuredSection) return;
    
    featuredSection.innerHTML = items.map((item, index) => `
        <div class="featured-item glass-card hover-scale" style="--delay: ${index * 0.1}s;">
            <div class="featured-image">
                <img src="${item.backdropPath}" alt="${item.title}">
                <div class="featured-overlay">
                    <div class="featured-badge">CineVerse Featured</div>
                    <h3>${item.title}</h3>
                    <p>${item.overview.slice(0, 150)}...</p>
                    <button class="watch-trailer-btn" onclick="playContent('${item.id}', '${item.type}')">
                        <i class="fas fa-play-circle"></i> Watch Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize Genre Filters
async function initializeGenreFilters() {
    try {
        // Get movie genres
        const movieGenres = await api.getGenres('movie');
        
        // Update filter buttons
        const filterContainer = document.querySelector('.filter-buttons');
        if (filterContainer) {
            filterContainer.innerHTML = `
                <button class="filter-btn active" data-filter="all">All</button>
                ${movieGenres.map(genre => `
                    <button class="filter-btn" data-filter="${genre.id}">${genre.name}</button>
                `).join('')}
            `;
            
            // Reinitialize filter functionality
            initializeFilterButtons();
        }
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// Initialize Filter Buttons
function initializeFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const movieCards = document.querySelectorAll('.movie-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get filter value
            const filter = btn.getAttribute('data-filter');
            
            // Filter movies
            movieCards.forEach(card => {
                const genres = card.getAttribute('data-genre').split(' ');
                
                if (filter === 'all' || genres.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Update Continue Watching Slider
function updateContinueWatchingSlider(container, items) {
    if (!container || !items.length) return;
    
    container.innerHTML = items.map(item => `
        <div class="movie-card continue-watching-card gradient-border" data-id="${item.id}" data-type="${item.type}">
            <div class="movie-poster">
                <img src="${item.posterPath}" alt="${item.title}">
                <div class="progress-bar">
                    <div class="progress" style="width: ${item.progress}%"></div>
                </div>
                <div class="movie-details">
                    <h3>${item.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-progress">${item.progress}% completed</span>
                    </div>
                    <p class="movie-desc">Continue watching where you left off</p>
                    <button class="watch-btn" onclick="playContent('${item.id}', '${item.type}', ${(item.progress / 100) * 7200})">
                        <i class="fas fa-play"></i> Resume
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add styles for progress bar if not exists
    if (!document.getElementById('continue-watching-styles')) {
        const style = document.createElement('style');
        style.id = 'continue-watching-styles';
        style.textContent = `
            .continue-watching-card .progress-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.3);
            }
            .continue-watching-card .progress {
                height: 100%;
                background-color: #e50914;
            }
            .continue-watching-card .movie-progress {
                font-size: 0.8rem;
                color: #e50914;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize hover effects
    initializeHoverEffects();
}

// Play Content
async function playContent(id, type, startTime = 0) {
    try {
        // Get content details
        const details = await api.getDetails(id, type);
        
        // Find trailer or video
        const trailer = details.videos.find(v => v.type === 'Trailer') || details.videos[0];
        
        if (!trailer) {
            showNotification('No video available for this content.', true);
            return;
        }
        
        // Create video player modal
        const playerModal = document.createElement('div');
        playerModal.className = 'video-player-modal';
        playerModal.innerHTML = `
            <div class="player-container">
                <div class="video-info">
                    <h2 class="video-title">${details.title}</h2>
                    <div class="video-meta">
                        <span class="video-year">${new Date(details.releaseDate).getFullYear()}</span>
                        <span class="video-rating">${details.rating.toFixed(1)}/10</span>
                        <span class="video-duration">${details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : 'N/A'}</span>
                    </div>
                </div>
                <div id="player"></div>
                <img class="video-poster" src="${details.posterPath}" style="display:none;" alt="${details.title}">
                <div class="player-controls">
                    <button class="close-player"><i class="fas fa-times"></i></button>
                    <button class="add-to-list" onclick="addToMyList(${id}, '${type}')">
                        <i class="fas fa-plus"></i> My List
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(playerModal);
        
        // Initialize video player
        if (activePlayer) {
            activePlayer.destroy();
        }
        
        activePlayer = new VideoPlayer('#player', {
            autoplay: true,
            muted: false
        });
        
        // Load video with start time
        activePlayer.loadVideo(`https://www.youtube.com/watch?v=${trailer.key}`, 'video/youtube', startTime);
        
        // Add to watch history if user is logged in
        if (userManager.currentUser) {
            userManager.addToWatchHistory(details, 0);
            
            // Set interval to update progress
            const progressInterval = setInterval(() => {
                if (activePlayer && activePlayer.video) {
                    const progress = Math.floor((activePlayer.video.currentTime / activePlayer.video.duration) * 100);
                    userManager.addToWatchHistory(details, progress);
                }
            }, 10000); // Update every 10 seconds
            
            // Clear interval when player is closed
            playerModal.addEventListener('remove', () => {
                clearInterval(progressInterval);
            });
        }
        
        // Add close button functionality
        const closeBtn = playerModal.querySelector('.close-player');
        closeBtn.addEventListener('click', () => {
            // Save final progress before closing
            if (userManager.currentUser && activePlayer && activePlayer.video) {
                const progress = Math.floor((activePlayer.video.currentTime / activePlayer.video.duration) * 100);
                userManager.addToWatchHistory(details, progress);
            }
            
            activePlayer.destroy();
            playerModal.remove();
        });
        
        // Show modal with animation
        setTimeout(() => {
            playerModal.classList.add('active');
        }, 10);
        
    } catch (error) {
        console.error('Error playing content:', error);
        showNotification('Error playing content. Please try again later.', true);
    }
}

// Add to My List
function addToMyList(id, type) {
    if (!userManager.currentUser) {
        showNotification('Please log in to add to your list', true);
        return;
    }
    
    api.getDetails(id, type)
        .then(details => {
            userManager.addToWatchlist(details);
        })
        .catch(error => {
            console.error('Error adding to list:', error);
            showNotification('Error adding to your list', true);
        });
}

// Initialize Hover Effects
function initializeHoverEffects() {
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-active');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-active');
        });
    });
}

// Show Notification
function showNotification(message, isError = false) {
    const notification = document.querySelector('.notification');
    const notificationText = notification.querySelector('p');
    
    notificationText.textContent = message;
    notification.className = `notification ${isError ? 'error' : ''} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Sticky Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Initialize content when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeContent();
});

// Modal Functionality
signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'flex';
    // Small delay to allow display:flex to take effect before adding the 'active' class
    setTimeout(() => {
        signupModal.classList.add('active');
    }, 10);
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', closeModal);

// Also close modal if clicking outside the modal content
signupModal.addEventListener('click', (e) => {
    if (e.target === signupModal) {
        closeModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && signupModal.classList.contains('active')) {
        closeModal();
    }
});

function closeModal() {
    signupModal.classList.remove('active');
    // Wait for the animation to complete before hiding the modal
    setTimeout(() => {
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 400);
}

// Signup Form Submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const plan = document.getElementById('plan').value;
    
    // You would normally send this data to a server
    console.log('Sign up form submitted with:', { name, email, password, plan });
    
    // Show a success message (just a simple alert for this demo)
    alert('Thank you for signing up to CineVerse!');
    
    // Close the modal
    closeModal();
    
    // Reset form
    signupForm.reset();
});

// Horizontal Scroll for Movie Sliders
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
});

function initializeSliders() {
    const sliders = document.querySelectorAll('.movies-slider');
    console.log(`Found ${sliders.length} sliders to initialize`);

    sliders.forEach((slider, index) => {
        console.log(`Initializing slider ${index + 1}`);
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // Set initial cursor style
        slider.style.cursor = 'grab';
    
    // Mouse events for desktop
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
    
    // Touch events for mobile
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    }, { passive: true });
    
    slider.addEventListener('touchend', () => {
        isDown = false;
    }, { passive: true });
    
    slider.addEventListener('touchcancel', () => {
        isDown = false;
    }, { passive: true });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    }, { passive: true });
    
    // Find the parent section and its arrow buttons
    const parentSection = slider.closest('section');
    if (parentSection) {
        const prevArrow = parentSection.querySelector('.prev-arrow');
        const nextArrow = parentSection.querySelector('.next-arrow');
        const paginationDots = parentSection.querySelectorAll('.pagination-dot');
        
        // Calculate scroll amount based on card width
        const cardWidth = slider.querySelector('.movie-card') ? 
                          slider.querySelector('.movie-card').offsetWidth + 24 : 300; // 24px for margin/gap
        
        console.log(`Slider in ${parentSection.className} has card width: ${cardWidth}px`);
        
        // Add click event for previous arrow
        if (prevArrow) {
            prevArrow.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous arrow clicked');
                
                // Calculate visible width
                const visibleWidth = slider.clientWidth;
                // Scroll by the visible width or by 2 cards, whichever is smaller
                const scrollAmount = Math.min(visibleWidth, cardWidth * 2);
                
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
                
                // Update pagination dots if they exist
                if (paginationDots.length > 0) {
                    setTimeout(() => {
                        updatePaginationDots(slider, paginationDots);
                    }, 300);
                }
            });
        }
        
        // Add click event for next arrow
        if (nextArrow) {
            nextArrow.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next arrow clicked');
                
                // Calculate visible width
                const visibleWidth = slider.clientWidth;
                // Scroll by the visible width or by 2 cards, whichever is smaller
                const scrollAmount = Math.min(visibleWidth, cardWidth * 2);
                
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
                
                // Update pagination dots if they exist
                if (paginationDots.length > 0) {
                    setTimeout(() => {
                        updatePaginationDots(slider, paginationDots);
                    }, 300);
                }
            });
        }
        
        // Add click events for pagination dots
        if (paginationDots.length > 0) {
            const totalCards = slider.querySelectorAll('.movie-card').length;
            const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
            const totalPages = Math.ceil(totalCards / visibleCards);
            
            // Make sure we have the right number of dots
            if (paginationDots.length !== totalPages) {
                console.log(`Pagination dots (${paginationDots.length}) don't match total pages (${totalPages})`);
            }
            
            paginationDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    // Calculate scroll position
                    const scrollPosition = index * visibleCards * cardWidth;
                    
                    // Scroll to position
                    slider.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active dot
                    paginationDots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                });
            });
            
            // Add scroll event to update dots
            slider.addEventListener('scroll', () => {
                updatePaginationDots(slider, paginationDots);
            });
        }
    }
    
    // Function to update pagination dots based on scroll position
    function updatePaginationDots(slider, dots) {
        if (!dots.length) return;
        
        const cardWidth = slider.querySelector('.movie-card').offsetWidth + 24;
        const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
        const scrollPosition = slider.scrollLeft;
        const totalWidth = slider.scrollWidth;
        
        // Calculate which page we're on
        const currentPage = Math.round(scrollPosition / (visibleCards * cardWidth));
        
        // Update active dot
        dots.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    });
}

// Lazy Loading for Movie Images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('src');
                
                // Apply a fade-in effect
                img.style.opacity = '0';
                img.src = src;
                
                img.onload = () => {
                    img.style.transition = 'opacity 0.5s ease';
                    img.style.opacity = '1';
                };
                
                // Stop observing once loaded
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => {
        observer.observe(img);
    });
});

// Simulate a loading state for the hero section
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '0';
    
    setTimeout(() => {
        heroContent.style.opacity = '1';
    }, 500);
}); 