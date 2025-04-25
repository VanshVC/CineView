// This file has been deprecated and replaced by local-data-service.js
(function() {
    'use strict';
    
    console.log('TMDB API has been removed and replaced with local data service');
    
    // Fallback images
    const FALLBACK_POSTER = 'https://via.placeholder.com/500x750?text=No+Image';
    
    // Debug mode - set to false for production
    const DEBUG = false;
    
    // DOM Elements
    let trendingMoviesContainer;
    let tvShowsContainer;
    let genreFiltersContainer;
    
    // Store genres after fetching them once
    let genresCache = [];
    
    // Track API status
    let apiAvailable = true;
    let apiStatusChecked = false;
    
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
     * Check if API is available
     */
    async function checkAPIAvailability() {
        if (apiStatusChecked) {
            return apiAvailable;
        }
        
        try {
            const response = await fetch(`${BASE_URL}/configuration?api_key=${API_KEY}`, { 
                method: 'HEAD',
                timeout: 5000
            });
            
            apiAvailable = response.ok;
            debug(`API availability check: ${apiAvailable ? 'Available' : 'Unavailable'}`);
        } catch (error) {
            apiAvailable = false;
            debug('API unavailable:', error.message);
        }
        
        apiStatusChecked = true;
        
        if (!apiAvailable) {
            showNotification('Using offline movie data due to connection issues', 'info');
        }
        
        return apiAvailable;
    }
    
    /**
     * Fetches data from TMDB API with local fallback
     */
    async function fetchFromTMDB(endpoint, params = {}, localData = null) {
        // Check if API is available
        const isAPIAvailable = await checkAPIAvailability();
        
        // If API is not available and we have local data, use it
        if (!isAPIAvailable && localData) {
            debug(`Using local data for ${endpoint}`);
            return localData;
        }
        
        // Try to fetch from API
        if (isAPIAvailable) {
            const queryParams = new URLSearchParams({
                api_key: API_KEY,
                ...params
            });
            
            const url = `${BASE_URL}${endpoint}?${queryParams}`;
            debug(`Fetching from: ${url}`);
            
            try {
                const response = await fetch(url, { timeout: 8000 });
                
                if (!response.ok) {
                    throw new Error(`TMDB API Error: ${response.status}`);
                }
                
                const data = await response.json();
                debug(`Received data for ${endpoint}`, data);
                return data;
            } catch (error) {
                console.error('Error fetching data from TMDB:', error);
                
                // If we have local data, use it as fallback
                if (localData) {
                    debug(`Falling back to local data for ${endpoint}`);
                    apiAvailable = false; // Mark API as unavailable for future requests
                    showNotification('Using offline movie data due to connection issues', 'info');
                    return localData;
                }
                
                // No local data available
                showErrorMessage(`Failed to fetch data: ${error.message}`);
                return { results: [] };
            }
        }
        
        // API is not available and no local data
        return { results: [] };
    }
    
    /**
     * Get full image URL from TMDB
     */
    function getImageUrl(path) {
        if (!path) {
            return FALLBACK_POSTER;
        }
        
        // If path is a full URL, return it as is
        if (path.startsWith('http')) {
            return path;
        }
        
        return `${IMAGE_BASE_URL}/${POSTER_SIZE}${path}`;
    }
    
    /**
     * Fetches trending movies
     */
    async function getTrendingMovies() {
        debug('Getting trending movies');
        return await fetchFromTMDB('/trending/movie/week', {}, SAMPLE_TRENDING_MOVIES);
    }
    
    /**
     * Fetches popular TV shows
     */
    async function getPopularTVShows() {
        debug('Getting popular TV shows');
        return await fetchFromTMDB('/tv/popular', {}, SAMPLE_TV_SHOWS);
    }
    
    /**
     * Fetches all movie genres
     */
    async function getMovieGenres() {
        debug('Getting movie genres');
        return await fetchFromTMDB('/genre/movie/list', {}, SAMPLE_GENRES);
    }
    
    /**
     * Fetches movies by genre
     */
    async function getMoviesByGenre(genreId) {
        debug(`Getting movies for genre ID: ${genreId}`);
        
        // For local data, filter the sample movies by genre
        const localFilteredMovies = {
            results: SAMPLE_TRENDING_MOVIES.results.filter(movie => 
                movie.genre_ids && movie.genre_ids.includes(Number(genreId))
            )
        };
        
        return await fetchFromTMDB('/discover/movie', {
            with_genres: genreId,
            sort_by: 'popularity.desc'
        }, localFilteredMovies);
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
     * Shows notification to the user
     */
    function showNotification(message, type = 'info') {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}-notification`;
        notificationElement.innerHTML = `
            <i class="fas ${type === 'info' ? 'fa-info-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notificationElement);
        
        // Add close button functionality
        const closeBtn = notificationElement.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (document.body.contains(notificationElement)) {
                    document.body.removeChild(notificationElement);
                }
            });
        }
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notificationElement)) {
                document.body.removeChild(notificationElement);
            }
        }, 5000);
    }
    
    /**
     * Initialize the application
     */
    async function initApp() {
        debug('Initializing application');
        
        // Initialize DOM elements
        initDOMElements();
        
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
        }
    }
    
    // Load sample data
    let SAMPLE_TRENDING_MOVIES = { results: [] };
    let SAMPLE_TV_SHOWS = { results: [] };
    let SAMPLE_GENRES = { genres: [] };
    
    // Load sample data from external file
    function loadSampleData() {
        const script = document.createElement('script');
        script.src = 'src/data/sample-movies.js';
        script.onload = function() {
            // Check if sample data is available in global scope
            if (window.SAMPLE_TRENDING_MOVIES) {
                SAMPLE_TRENDING_MOVIES = window.SAMPLE_TRENDING_MOVIES;
                SAMPLE_TV_SHOWS = window.SAMPLE_TV_SHOWS;
                SAMPLE_GENRES = window.SAMPLE_GENRES;
                debug('Sample data loaded successfully');
                
                // Initialize the app after sample data is loaded
                initApp();
            } else {
                debug('Sample data not found in global scope');
                // Initialize anyway
                initApp();
            }
        };
        script.onerror = function() {
            debug('Failed to load sample data');
            // Initialize anyway
            initApp();
        };
        document.head.appendChild(script);
    }
    
    // Initialize the app when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSampleData);
    } else {
        // DOM already loaded, initialize immediately
        loadSampleData();
    }
    
    // Expose the init function globally for debugging
    window.initTMDB = initApp;
    
    // No debug buttons or testing UI in production
    
})();