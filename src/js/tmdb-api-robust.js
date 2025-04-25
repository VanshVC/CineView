// This file has been deprecated and replaced by local-data-service.js
(function() {
    'use strict';
    
    console.log('TMDB API has been removed and replaced with local data service');
    
    // Fallback images
    const FALLBACK_POSTER = 'https://via.placeholder.com/500x750?text=No+Image';
    
    // Debug mode
    const DEBUG = true;
    
    // DOM Elements
    let trendingMoviesContainer;
    let tvShowsContainer;
    let genreFiltersContainer;
    let loadingIndicator;
    
    // Store genres after fetching them once
    let genresCache = [];
    
    // Track fetch attempts
    let fetchAttempts = 0;
    const MAX_FETCH_ATTEMPTS = 3;
    
    /**
     * Debug logging function
     */
    function debug(message, data) {
        if (DEBUG) {
            console.log(`[TMDB Debug] ${message}`, data || '');
        }
    }
    
    /**
     * Initialize DOM elements
     */
    function initDOMElements() {
        debug('Initializing DOM elements');
        
        trendingMoviesContainer = document.querySelector('#trending-movies');
        tvShowsContainer = document.querySelector('#tv-shows');
        genreFiltersContainer = document.querySelector('.filter-buttons');
        
        // Create loading indicator if it doesn't exist
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading content...</p>';
        }
        
        // Show empty states
        if (trendingMoviesContainer) {
            const emptyState = trendingMoviesContainer.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'block';
        }
        
        if (tvShowsContainer) {
            const emptyState = tvShowsContainer.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'block';
        }
    }
    
    /**
     * Fetches data from TMDB API with multiple fallback methods
     */
    async function fetchFromTMDB(endpoint, params = {}) {
        const queryParams = new URLSearchParams({
            api_key: API_KEY,
            ...params
        });
        
        const url = `${BASE_URL}${endpoint}?${queryParams}`;
        debug(`Fetching from: ${url}`);
        
        // Reset fetch attempts for new requests
        fetchAttempts = 0;
        
        // Try different fetch methods
        return await tryFetchMethods(url);
    }
    
    /**
     * Try different fetch methods to handle CORS and other issues
     */
    async function tryFetchMethods(url) {
        fetchAttempts++;
        debug(`Fetch attempt ${fetchAttempts} for ${url}`);
        
        try {
            // Method 1: Standard fetch
            if (fetchAttempts === 1) {
                debug('Trying standard fetch');
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`TMDB API Error: ${response.status}`);
                }
                
                return await response.json();
            }
            
            // Method 2: Fetch with credentials: 'omit'
            else if (fetchAttempts === 2) {
                debug('Trying fetch with credentials: omit');
                const response = await fetch(url, { 
                    credentials: 'omit',
                    cache: 'no-cache'
                });
                
                if (!response.ok) {
                    throw new Error(`TMDB API Error: ${response.status}`);
                }
                
                return await response.json();
            }
            
            // Method 3: XMLHttpRequest as fallback
            else if (fetchAttempts === 3) {
                debug('Trying XMLHttpRequest');
                return await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url);
                    xhr.onload = function() {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error(`TMDB API Error: ${xhr.status}`));
                        }
                    };
                    xhr.onerror = function() {
                        reject(new Error('Network error with XMLHttpRequest'));
                    };
                    xhr.send();
                });
            }
            
            throw new Error('All fetch methods failed');
            
        } catch (error) {
            debug(`Fetch attempt ${fetchAttempts} failed: ${error.message}`);
            
            // Try next method if we haven't exceeded max attempts
            if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
                return await tryFetchMethods(url);
            }
            
            // All methods failed
            console.error('All fetch methods failed:', error);
            showErrorMessage(`Failed to fetch data: ${error.message}`);
            
            // Return empty results to prevent further errors
            return { results: [] };
        }
    }
    
    /**
     * Get full image URL from TMDB
     */
    function getImageUrl(path) {
        if (!path) {
            return FALLBACK_POSTER;
        }
        return `${IMAGE_BASE_URL}/${POSTER_SIZE}${path}`;
    }
    
    /**
     * Fetches trending movies
     */
    async function getTrendingMovies() {
        debug('Getting trending movies');
        return await fetchFromTMDB('/trending/movie/week');
    }
    
    /**
     * Fetches popular TV shows
     */
    async function getPopularTVShows() {
        debug('Getting popular TV shows');
        return await fetchFromTMDB('/tv/popular');
    }
    
    /**
     * Fetches all movie genres
     */
    async function getMovieGenres() {
        debug('Getting movie genres');
        return await fetchFromTMDB('/genre/movie/list');
    }
    
    /**
     * Fetches movies by genre
     */
    async function getMoviesByGenre(genreId) {
        debug(`Getting movies for genre ID: ${genreId}`);
        return await fetchFromTMDB('/discover/movie', {
            with_genres: genreId,
            sort_by: 'popularity.desc'
        });
    }
    
    /**
     * Renders movie cards in the specified container
     */
    function renderMovies(movies, container) {
        if (!container) {
            debug('Container not found for rendering movies');
            return;
        }
        
        debug(`Rendering ${movies.length} movies`);
        
        // Clear existing content
        container.innerHTML = '';
        
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>No Movies Found</h3>
                    <p>We couldn't find any movies matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Create movie cards
        movies.slice(0, 10).forEach(movie => {
            const movieCard = createMovieCard(movie);
            container.appendChild(movieCard);
        });
    }
    
    /**
     * Renders TV show cards in the specified container
     */
    function renderTVShows(shows, container) {
        if (!container) {
            debug('Container not found for rendering TV shows');
            return;
        }
        
        debug(`Rendering ${shows.length} TV shows`);
        
        // Clear existing content
        container.innerHTML = '';
        
        if (shows.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tv"></i>
                    <h3>No TV Shows Found</h3>
                    <p>We couldn't find any TV shows matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Create TV show cards
        shows.slice(0, 10).forEach(show => {
            const showCard = createTVShowCard(show);
            container.appendChild(showCard);
        });
    }
    
    /**
     * Creates a movie card element
     */
    function createMovieCard(movie) {
        try {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
            const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : '?';
            
            card.innerHTML = `
                <div class="movie-poster">
                    <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}" onerror="this.src='${FALLBACK_POSTER}'">
                    <div class="movie-badge">
                        <span>${rating}</span>
                    </div>
                </div>
                <div class="movie-details">
                    <h3>${movie.title || 'Untitled'}</h3>
                    <div class="movie-meta">
                        <span class="movie-genre">${getGenreNames(movie.genre_ids).join(', ')}</span>
                        <span class="movie-year">${releaseYear}</span>
                    </div>
                    <div class="movie-actions">
                        <button class="watch-btn"><i class="fas fa-play"></i> Watch</button>
                        <button class="add-list-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
            
            return card;
        } catch (error) {
            console.error('Error creating movie card:', error, movie);
            const errorCard = document.createElement('div');
            errorCard.className = 'movie-card error-card';
            errorCard.textContent = 'Error loading movie';
            return errorCard;
        }
    }
    
    /**
     * Creates a TV show card element
     */
    function createTVShowCard(show) {
        try {
            const card = document.createElement('div');
            card.className = 'movie-card tv-card';
            
            const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
            const rating = show.vote_average ? (show.vote_average / 2).toFixed(1) : '?';
            
            card.innerHTML = `
                <div class="movie-poster">
                    <img src="${getImageUrl(show.poster_path)}" alt="${show.name}" onerror="this.src='${FALLBACK_POSTER}'">
                    <div class="movie-badge">
                        <span>${rating}</span>
                    </div>
                </div>
                <div class="movie-details">
                    <h3>${show.name || 'Untitled'}</h3>
                    <div class="movie-meta">
                        <span class="movie-genre">${getGenreNames(show.genre_ids).join(', ')}</span>
                        <span class="movie-year">${firstAirYear}</span>
                    </div>
                    <div class="movie-actions">
                        <button class="watch-btn"><i class="fas fa-play"></i> Watch</button>
                        <button class="add-list-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
            
            return card;
        } catch (error) {
            console.error('Error creating TV show card:', error, show);
            const errorCard = document.createElement('div');
            errorCard.className = 'movie-card error-card';
            errorCard.textContent = 'Error loading TV show';
            return errorCard;
        }
    }
    
    /**
     * Get genre names from genre IDs
     */
    function getGenreNames(genreIds) {
        if (!genreIds || !genreIds.length) return ['Unknown'];
        
        return genreIds
            .slice(0, 2)
            .map(id => {
                const genre = genresCache.find(g => g.id === id);
                return genre ? genre.name : 'Unknown';
            });
    }
    
    /**
     * Renders genre filter buttons
     */
    function renderGenreFilters(genres) {
        if (!genreFiltersContainer) {
            debug('Genre filter container not found');
            return;
        }
        
        // Store genres in cache for later use
        genresCache = genres;
        
        debug(`Rendering ${genres.length} genre filters`);
        
        // Clear existing filters
        genreFiltersContainer.innerHTML = '<button class="filter-btn active" data-genre="all">All</button>';
        
        // Add genre buttons
        genres.slice(0, 8).forEach(genre => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-genre', genre.id);
            button.textContent = genre.name;
            genreFiltersContainer.appendChild(button);
        });
        
        // Add event listeners to filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', handleGenreFilter);
        });
    }
    
    /**
     * Handles genre filter button clicks
     */
    async function handleGenreFilter(event) {
        const genreId = event.target.getAttribute('data-genre');
        debug(`Genre filter clicked: ${genreId}`);
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Show loading indicator
        document.body.appendChild(loadingIndicator);
        
        try {
            let movies;
            
            if (genreId === 'all') {
                // If "All" is selected, fetch trending movies
                const data = await getTrendingMovies();
                movies = data.results;
            } else {
                // Fetch movies by selected genre
                const data = await getMoviesByGenre(genreId);
                movies = data.results;
            }
            
            // Update UI with filtered movies
            renderMovies(movies, trendingMoviesContainer);
        } catch (error) {
            console.error('Error filtering by genre:', error);
            showErrorMessage('Failed to load movies for this genre. Please try again.');
        } finally {
            // Remove loading indicator
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }
        }
    }
    
    /**
     * Shows error message to the user
     */
    function showErrorMessage(message) {
        console.error(`Error: ${message}`);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(errorElement);
        
        // Add close button functionality
        const closeBtn = errorElement.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (document.body.contains(errorElement)) {
                    document.body.removeChild(errorElement);
                }
            });
        }
        
        // Remove error message after 8 seconds
        setTimeout(() => {
            if (document.body.contains(errorElement)) {
                document.body.removeChild(errorElement);
            }
        }, 8000);
    }
    
    /**
     * Initialize the application
     */
    async function initApp() {
        debug('Initializing application');
        
        // Initialize DOM elements
        initDOMElements();
        
        // Add loading indicator
        document.body.appendChild(loadingIndicator);
        
        try {
            debug('Fetching initial data');
            
            // First try to get genres since we need them for movie/show rendering
            const genresData = await getMovieGenres();
            
            if (genresData && genresData.genres) {
                genresCache = genresData.genres;
                renderGenreFilters(genresData.genres);
            }
            
            // Load trending movies and TV shows in parallel
            const [trendingData, tvShowsData] = await Promise.all([
                getTrendingMovies(),
                getPopularTVShows()
            ]);
            
            debug('Data fetched successfully', { 
                trending: trendingData ? trendingData.results.length : 0,
                tvShows: tvShowsData ? tvShowsData.results.length : 0,
                genres: genresCache.length
            });
            
            // Populate UI with fetched data
            if (trendingData && trendingData.results) {
                renderMovies(trendingData.results, trendingMoviesContainer);
            }
            
            if (tvShowsData && tvShowsData.results) {
                renderTVShows(tvShowsData.results, tvShowsContainer);
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            showErrorMessage('Failed to load content. Please try again later.');
        } finally {
            // Remove loading indicator
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }
        }
    }
    
    // Initialize the app when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM already loaded, initialize immediately
        initApp();
    }
    
    // Expose the init function globally for debugging
    window.initTMDB = initApp;
    
    // Add a retry button to the page
    function addRetryButton() {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry Loading Content';
        retryButton.className = 'retry-button';
        retryButton.style.position = 'fixed';
        retryButton.style.bottom = '20px';
        retryButton.style.right = '20px';
        retryButton.style.zIndex = '9999';
        retryButton.style.background = 'var(--accent-color, #7b2cbf)';
        retryButton.style.color = 'white';
        retryButton.style.border = 'none';
        retryButton.style.padding = '10px 20px';
        retryButton.style.borderRadius = '5px';
        retryButton.style.cursor = 'pointer';
        retryButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        
        retryButton.addEventListener('click', function() {
            initApp();
        });
        
        document.body.appendChild(retryButton);
    }
    
    // Add retry button after a short delay
    setTimeout(addRetryButton, 2000);
    
})();