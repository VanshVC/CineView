import {
    getImageUrl,
    getPopularTVShows,
    getTVShowDetailsByTitle,
    searchOMDB,
    getEnhancedTVShowDetails
} from './api.js';

// DOM Elements
const trendingSlides = document.getElementById('trendingSlides');
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading content...</p>';

// Initialize the TV shows page
async function initTVShowsPage() {
    // Add loading indicator
    document.body.appendChild(loadingIndicator);
    
    try {
        // Load popular TV shows
        const tvShowsData = await getPopularTVShows();
        
        if (tvShowsData && tvShowsData.results) {
            await renderEnhancedTVShows(tvShowsData.results);
        }
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing TV shows page:', error);
        showErrorMessage('Failed to load TV shows. Please try again later.');
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
    }
}

/**
 * Renders enhanced TV show cards with OMDB data
 * @param {Array} shows - Array of TV show objects
 */
async function renderEnhancedTVShows(shows) {
    if (!trendingSlides) return;
    
    // Clear existing content
    trendingSlides.innerHTML = '';
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-state';
    loadingElement.innerHTML = '<div class="spinner"></div><p>Enhancing TV show data with OMDB...</p>';
    trendingSlides.appendChild(loadingElement);
    
    try {
        // Process TV shows in batches to avoid overwhelming the API
        const enhancedShows = [];
        const batchSize = 3;
        
        for (let i = 0; i < Math.min(shows.length, 12); i += batchSize) {
            const batch = shows.slice(i, i + batchSize);
            const batchPromises = batch.map(show => getEnhancedTVShowDetails(show));
            const batchResults = await Promise.all(batchPromises);
            enhancedShows.push(...batchResults);
        }
        
        // Clear loading state
        trendingSlides.innerHTML = '';
        
        // Create TV show cards with enhanced data
        enhancedShows.forEach(show => {
            const showCard = createEnhancedTVShowCard(show);
            trendingSlides.appendChild(showCard);
        });
    } catch (error) {
        console.error('Error enhancing TV show data:', error);
        
        // Fallback to original data if enhancement fails
        trendingSlides.innerHTML = '';
        shows.slice(0, 12).forEach(show => {
            const showCard = createBasicTVShowCard(show);
            trendingSlides.appendChild(showCard);
        });
    }
}

/**
 * Creates an enhanced TV show card with OMDB data
 * @param {Object} show - Enhanced TV show data
 * @returns {HTMLElement} - TV show card element
 */
function createEnhancedTVShowCard(show) {
    const slide = document.createElement('div');
    slide.className = 'trending-slide';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-genre', show.genre_ids ? show.genre_ids[0] : '');
    
    const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
    const tmdbRating = show.vote_average ? show.vote_average.toFixed(1) : '?';
    
    // OMDB enhanced data
    const imdbRating = show.imdbRating || '';
    const rated = show.rated || '';
    const totalSeasons = show.totalSeasons ? `${show.totalSeasons} Seasons` : '';
    const hasOmdbData = show.omdb && show.omdb.Response === 'True';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(show.poster_path)}" alt="${show.name}">
            ${rated ? `<span class="content-rating">${rated}</span>` : ''}
            <div class="movie-details">
                <h3>${show.name}</h3>
                <div class="movie-meta">
                    <span class="movie-rating"><i class="fas fa-star"></i> ${tmdbRating}</span>
                    ${imdbRating ? `<span class="movie-rating imdb-rating"><i class="fab fa-imdb"></i> ${imdbRating}</span>` : ''}
                    <span class="movie-year">${firstAirYear}</span>
                    ${totalSeasons ? `<span class="seasons"><i class="fas fa-tv"></i> ${totalSeasons}</span>` : ''}
                </div>
                <p class="movie-desc">${show.overview.substring(0, 100)}...</p>
                <div class="card-actions">
                    <button class="watch-btn" data-video="https://www.youtube.com/embed/dQw4w9WgXcQ" data-title="${show.name}">
                        <i class="fas fa-play"></i> Watch Now
                    </button>
                    ${hasOmdbData ? `<button class="info-btn"><i class="fas fa-info-circle"></i> Details</button>` : ''}
                </div>
                ${hasOmdbData ? `<div class="omdb-badge" title="Enhanced with OMDB data">OMDB</div>` : ''}
            </div>
        </div>
    `;
    
    // Add event listener for the info button if OMDB data is available
    if (hasOmdbData) {
        const infoBtn = card.querySelector('.info-btn');
        infoBtn.addEventListener('click', () => {
            showTVShowDetails(show);
        });
    }
    
    slide.appendChild(card);
    return slide;
}

/**
 * Creates a basic TV show card without OMDB data (fallback)
 * @param {Object} show - Basic TV show data
 * @returns {HTMLElement} - TV show card element
 */
function createBasicTVShowCard(show) {
    const slide = document.createElement('div');
    slide.className = 'trending-slide';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-genre', show.genre_ids ? show.genre_ids[0] : '');
    
    const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
    const rating = show.vote_average ? show.vote_average.toFixed(1) : '?';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(show.poster_path)}" alt="${show.name}">
            <div class="movie-details">
                <h3>${show.name}</h3>
                <div class="movie-meta">
                    <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="movie-year">${firstAirYear}</span>
                </div>
                <p class="movie-desc">${show.overview.substring(0, 100)}...</p>
                <button class="watch-btn" data-video="https://www.youtube.com/embed/dQw4w9WgXcQ" data-title="${show.name}">
                    <i class="fas fa-play"></i> Watch Now
                </button>
            </div>
        </div>
    `;
    
    slide.appendChild(card);
    return slide;
}

/**
 * Shows detailed TV show information in a modal
 * @param {Object} show - Enhanced TV show data
 */
function showTVShowDetails(show) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    
    const omdb = show.omdb || {};
    const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <div class="modal-poster">
                    <img src="${getImageUrl(show.poster_path)}" alt="${show.name}">
                </div>
                <div class="modal-title">
                    <h2>${show.name} <span class="year">(${firstAirYear})</span></h2>
                    <div class="modal-meta">
                        ${omdb.Rated ? `<span class="rated">${omdb.Rated}</span>` : ''}
                        ${omdb.totalSeasons ? `<span class="seasons">${omdb.totalSeasons} Seasons</span>` : ''}
                        ${omdb.Genre ? `<span class="genre">${omdb.Genre}</span>` : ''}
                        ${omdb.Released ? `<span class="release-date">First Aired: ${omdb.Released}</span>` : ''}
                    </div>
                    <div class="ratings">
                        ${omdb.imdbRating ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fab fa-imdb"></i> IMDb</span>
                                <span class="rating-value">${omdb.imdbRating}/10</span>
                                <span class="rating-count">${omdb.imdbVotes} votes</span>
                            </div>
                        ` : ''}
                        ${show.vote_average ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fas fa-film"></i> TMDB</span>
                                <span class="rating-value">${show.vote_average}/10</span>
                                <span class="rating-count">${show.vote_count} votes</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <div class="plot">
                    <h3>Plot</h3>
                    <p>${omdb.Plot || show.overview}</p>
                </div>
                <div class="details-grid">
                    ${omdb.Writer && omdb.Writer !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Creator</h4>
                            <p>${omdb.Writer}</p>
                        </div>
                    ` : ''}
                    ${omdb.Actors && omdb.Actors !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Cast</h4>
                            <p>${omdb.Actors}</p>
                        </div>
                    ` : ''}
                    ${omdb.Awards && omdb.Awards !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Awards</h4>
                            <p>${omdb.Awards}</p>
                        </div>
                    ` : ''}
                    ${omdb.Country && omdb.Country !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Country</h4>
                            <p>${omdb.Country}</p>
                        </div>
                    ` : ''}
                    ${omdb.Language && omdb.Language !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Language</h4>
                            <p>${omdb.Language}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="watch-btn primary-btn"><i class="fas fa-play"></i> Watch Now</button>
                ${omdb.imdbID ? `
                    <a href="https://www.imdb.com/title/${omdb.imdbID}" target="_blank" class="imdb-link">
                        <i class="fab fa-imdb"></i> View on IMDb
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add event listener to close the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Handles search form submission
 * @param {Event} event - Submit event
 */
async function handleSearch(event) {
    event.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    // Show loading indicator
    searchResults.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Searching...</p></div>';
    searchResults.style.display = 'block';
    
    try {
        // Search OMDB for TV shows
        const results = await searchOMDB(query, 'series');
        
        if (results && results.Response === 'True' && results.Search) {
            displaySearchResults(results.Search);
        } else {
            searchResults.innerHTML = '<p class="no-results">No results found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error searching TV shows:', error);
        searchResults.innerHTML = '<p class="error-message">Error searching. Please try again.</p>';
    }
}

/**
 * Displays search results
 * @param {Array} results - Search results
 */
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    results.forEach(async (result) => {
        // Get detailed TV show info from OMDB
        const detailedInfo = await getTVShowDetailsByTitle(result.Title);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        resultItem.innerHTML = `
            <div class="result-poster">
                <img src="${result.Poster !== 'N/A' ? result.Poster : 'src/images/placeholder.jpg'}" alt="${result.Title}">
            </div>
            <div class="result-details">
                <h3>${result.Title}</h3>
                <div class="result-meta">
                    <span class="result-year">${result.Year}</span>
                    ${detailedInfo && detailedInfo.imdbRating !== 'N/A' ? 
                        `<span class="result-rating"><i class="fab fa-imdb"></i> ${detailedInfo.imdbRating}</span>` : ''}
                    ${detailedInfo && detailedInfo.totalSeasons !== 'N/A' ? 
                        `<span class="result-seasons"><i class="fas fa-tv"></i> ${detailedInfo.totalSeasons} Seasons</span>` : ''}
                </div>
                ${detailedInfo && detailedInfo.Plot !== 'N/A' ? 
                    `<p class="result-plot">${detailedInfo.Plot.substring(0, 100)}...</p>` : ''}
                <button class="view-details-btn" data-title="${result.Title}">View Details</button>
            </div>
        `;
        
        // Add event listener to view details button
        const viewDetailsBtn = resultItem.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', async () => {
            const show = await getTVShowDetailsByTitle(result.Title);
            if (show && show.Response === 'True') {
                showOMDBTVShowDetails(show);
            }
        });
        
        searchResults.appendChild(resultItem);
    });
}

/**
 * Shows detailed TV show information from OMDB in a modal
 * @param {Object} show - OMDB TV show data
 */
function showOMDBTVShowDetails(show) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <div class="modal-poster">
                    <img src="${show.Poster !== 'N/A' ? show.Poster : 'src/images/placeholder.jpg'}" alt="${show.Title}">
                </div>
                <div class="modal-title">
                    <h2>${show.Title} <span class="year">(${show.Year})</span></h2>
                    <div class="modal-meta">
                        ${show.Rated !== 'N/A' ? `<span class="rated">${show.Rated}</span>` : ''}
                        ${show.totalSeasons !== 'N/A' ? `<span class="seasons">${show.totalSeasons} Seasons</span>` : ''}
                        ${show.Genre !== 'N/A' ? `<span class="genre">${show.Genre}</span>` : ''}
                        ${show.Released !== 'N/A' ? `<span class="release-date">First Aired: ${show.Released}</span>` : ''}
                    </div>
                    <div class="ratings">
                        ${show.imdbRating !== 'N/A' ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fab fa-imdb"></i> IMDb</span>
                                <span class="rating-value">${show.imdbRating}/10</span>
                                <span class="rating-count">${show.imdbVotes} votes</span>
                            </div>
                        ` : ''}
                        ${show.Metascore !== 'N/A' ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fas fa-chart-bar"></i> Metascore</span>
                                <span class="rating-value">${show.Metascore}/100</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <div class="plot">
                    <h3>Plot</h3>
                    <p>${show.Plot !== 'N/A' ? show.Plot : 'Plot information not available.'}</p>
                </div>
                <div class="details-grid">
                    ${show.Writer !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Creator</h4>
                            <p>${show.Writer}</p>
                        </div>
                    ` : ''}
                    ${show.Actors !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Cast</h4>
                            <p>${show.Actors}</p>
                        </div>
                    ` : ''}
                    ${show.Awards !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Awards</h4>
                            <p>${show.Awards}</p>
                        </div>
                    ` : ''}
                    ${show.Country !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Country</h4>
                            <p>${show.Country}</p>
                        </div>
                    ` : ''}
                    ${show.Language !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Language</h4>
                            <p>${show.Language}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="watch-btn primary-btn"><i class="fas fa-play"></i> Watch Now</button>
                <a href="https://www.imdb.com/title/${show.imdbID}" target="_blank" class="imdb-link">
                    <i class="fab fa-imdb"></i> View on IMDb
                </a>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add event listener to close the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Sets up event listeners for the page
 */
function setupEventListeners() {
    // Carousel navigation
    const prevBtn = document.querySelector('.trending-prev');
    const nextBtn = document.querySelector('.trending-next');
    
    if (prevBtn && nextBtn && trendingSlides) {
        let currentSlide = 0;
        const slides = trendingSlides.querySelectorAll('.trending-slide');
        const maxSlides = slides.length;
        
        // Show slides function
        const showSlides = (n) => {
            slides.forEach((slide, index) => {
                slide.style.transform = `translateX(${100 * (index - n)}%)`;
            });
        };
        
        // Initialize slides
        showSlides(currentSlide);
        
        // Previous button
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide > 0) ? currentSlide - 1 : maxSlides - 1;
            showSlides(currentSlide);
        });
        
        // Next button
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide < maxSlides - 1) ? currentSlide + 1 : 0;
            showSlides(currentSlide);
        });
    }
    
    // Search form
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Search input focus/blur
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            document.getElementById('searchContainer').classList.add('active');
        });
        
        // Close search when clicking outside
        document.addEventListener('click', (event) => {
            const searchContainer = document.getElementById('searchContainer');
            if (!searchContainer.contains(event.target) && event.target !== searchInput) {
                searchContainer.classList.remove('active');
                searchResults.style.display = 'none';
            }
        });
    }
    
    // Watch buttons
    document.querySelectorAll('.watch-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoUrl = event.currentTarget.getAttribute('data-video');
            const videoTitle = event.currentTarget.getAttribute('data-title');
            
            if (videoUrl) {
                showVideoPlayer(videoUrl, videoTitle);
            }
        });
    });
}

/**
 * Shows a video player modal
 * @param {string} videoUrl - URL of the video to play
 * @param {string} title - Title of the video
 */
function showVideoPlayer(videoUrl, title) {
    const playerModal = document.createElement('div');
    playerModal.className = 'video-player-modal';
    
    playerModal.innerHTML = `
        <div class="video-player-container">
            <button class="close-player"><i class="fas fa-times"></i></button>
            <h2>${title}</h2>
            <div class="video-wrapper">
                <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(playerModal);
    
    // Add event listener to close the modal
    const closeBtn = playerModal.querySelector('.close-player');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(playerModal);
    });
    
    // Close modal when clicking outside the content
    playerModal.addEventListener('click', (event) => {
        if (event.target === playerModal) {
            document.body.removeChild(playerModal);
        }
    });
}

/**
 * Shows error message to the user
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        document.body.removeChild(errorElement);
    }, 5000);
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initTVShowsPage);

// Export functions for potential reuse
export {
    initTVShowsPage,
    renderEnhancedTVShows,
    showTVShowDetails,
    handleSearch
};