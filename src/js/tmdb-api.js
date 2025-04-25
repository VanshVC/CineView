// This file has been deprecated and replaced by local-data-service.js
console.log('TMDB API has been removed and replaced with local data service');

// DOM Elements
const trendingMoviesContainer = document.querySelector('#trending-movies');
const tvShowsContainer = document.querySelector('#tv-shows');
const genreFiltersContainer = document.querySelector('.filter-buttons');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading content...</p>';

// Debug flag
const DEBUG = true;

/**
 * Debug logging function
 */
function debug(message, data) {
    if (DEBUG) {
        console.log(`[TMDB Debug] ${message}`, data || '');
    }
}

/**
 * Fetches data from TMDB API
 */
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        ...params
    });
    
    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    debug(`Fetching from: ${url}`);
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status}`);
        }
        
        const data = await response.json();
        debug(`Received data for ${endpoint}`, data);
        return data;
    } catch (error) {
        console.error('Error fetching data from TMDB:', error);
        showErrorMessage(`API Error: ${error.message}`);
        return null;
    }
}

/**
 * Get full image URL from TMDB
 */
function getImageUrl(path) {
    if (!path) {
        return 'https://via.placeholder.com/500x750?text=No+Image+Available';
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
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : '?';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}">
            <div class="movie-badge">
                <span>${rating}</span>
            </div>
        </div>
        <div class="movie-details">
            <h3>${movie.title}</h3>
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
}

/**
 * Creates a TV show card element
 */
function createTVShowCard(show) {
    const card = document.createElement('div');
    card.className = 'movie-card tv-card';
    
    const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
    const rating = show.vote_average ? (show.vote_average / 2).toFixed(1) : '?';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(show.poster_path)}" alt="${show.name}">
            <div class="movie-badge">
                <span>${rating}</span>
            </div>
        </div>
        <div class="movie-details">
            <h3>${show.name}</h3>
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
}

// Store genres after fetching them once
let genresCache = [];

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
        document.body.removeChild(loadingIndicator);
    }
}

/**
 * Shows error message to the user
 */
function showErrorMessage(message) {
    console.error(`Error: ${message}`);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorElement)) {
            document.body.removeChild(errorElement);
        }
    }, 5000);
}

/**
 * Initialize the application
 */
async function initApp() {
    debug('Initializing application');
    
    // Show empty states
    if (trendingMoviesContainer) {
        const emptyState = trendingMoviesContainer.querySelector('.empty-state');
        if (emptyState) emptyState.style.display = 'block';
    }
    
    if (tvShowsContainer) {
        const emptyState = tvShowsContainer.querySelector('.empty-state');
        if (emptyState) emptyState.style.display = 'block';
    }
    
    // Add loading indicator
    document.body.appendChild(loadingIndicator);
    
    try {
        debug('Fetching initial data');
        
        // Load all data in parallel
        const [trendingData, tvShowsData, genresData] = await Promise.all([
            getTrendingMovies(),
            getPopularTVShows(),
            getMovieGenres()
        ]);
        
        debug('Data fetched successfully', { 
            trending: trendingData ? trendingData.results.length : 0,
            tvShows: tvShowsData ? tvShowsData.results.length : 0,
            genres: genresData ? genresData.genres.length : 0
        });
        
        // Populate UI with fetched data
        if (genresData && genresData.genres) {
            renderGenreFilters(genresData.genres);
        }
        
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
document.addEventListener('DOMContentLoaded', function() {
    debug('DOM fully loaded');
    initApp();
});

// Also expose the init function globally for debugging
window.initTMDB = initApp;