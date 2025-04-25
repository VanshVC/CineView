import {
    getImageUrl,
    getTrendingMovies,
    getPopularTVShows,
    getMoviesByGenre,
    getMovieGenres,
    getEnhancedMovieDetails,
    getEnhancedTVShowDetails,
    getMovieDetailsByTitle,
    getMovieDetailsByImdbId,
    getTVShowDetailsByTitle,
    searchOMDB
} from './api.js';

// DOM Elements
const trendingMoviesContainer = document.querySelector('#trending-movies');
const tvShowsContainer = document.querySelector('#tv-shows');
const genreFiltersContainer = document.querySelector('.filter-buttons');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading content...</p>';

// Initialize the application
async function initApp() {
    // Add loading indicator
    document.body.appendChild(loadingIndicator);
    
    try {
        // Load all data in parallel
        const [trendingData, tvShowsData, genresData] = await Promise.all([
            getTrendingMovies(),
            getPopularTVShows(),
            getMovieGenres()
        ]);
        
        // Populate UI with fetched data
        if (trendingData && trendingData.results) {
            renderMovies(trendingData.results, trendingMoviesContainer);
        }
        
        if (tvShowsData && tvShowsData.results) {
            renderTVShows(tvShowsData.results, tvShowsContainer);
        }
        
        if (genresData && genresData.genres) {
            renderGenreFilters(genresData.genres);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorMessage('Failed to load content. Please try again later.');
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
    }
}

/**
 * Renders movie cards in the specified container
 * @param {Array} movies - Array of movie objects
 * @param {HTMLElement} container - Container element
 */
async function renderMovies(movies, container) {
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-state';
    loadingElement.innerHTML = '<div class="spinner"></div><p>Enhancing movie data...</p>';
    container.appendChild(loadingElement);
    
    try {
        // Process movies in batches to avoid overwhelming the API
        const enhancedMovies = [];
        const batchSize = 3;
        
        for (let i = 0; i < Math.min(movies.length, 10); i += batchSize) {
            const batch = movies.slice(i, i + batchSize);
            const batchPromises = batch.map(movie => getEnhancedMovieDetails(movie));
            const batchResults = await Promise.all(batchPromises);
            enhancedMovies.push(...batchResults);
        }
        
        // Clear loading state
        container.innerHTML = '';
        
        // Create movie cards with enhanced data
        enhancedMovies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            container.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error enhancing movie data:', error);
        
        // Fallback to original data if enhancement fails
        container.innerHTML = '';
        movies.slice(0, 10).forEach(movie => {
            const movieCard = createMovieCard(movie);
            container.appendChild(movieCard);
        });
    }
}

/**
 * Renders TV show cards in the specified container
 * @param {Array} shows - Array of TV show objects
 * @param {HTMLElement} container - Container element
 */
async function renderTVShows(shows, container) {
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-state';
    loadingElement.innerHTML = '<div class="spinner"></div><p>Enhancing TV show data...</p>';
    container.appendChild(loadingElement);
    
    try {
        // Process TV shows in batches to avoid overwhelming the API
        const enhancedShows = [];
        const batchSize = 3;
        
        for (let i = 0; i < Math.min(shows.length, 10); i += batchSize) {
            const batch = shows.slice(i, i + batchSize);
            const batchPromises = batch.map(show => getEnhancedTVShowDetails(show));
            const batchResults = await Promise.all(batchPromises);
            enhancedShows.push(...batchResults);
        }
        
        // Clear loading state
        container.innerHTML = '';
        
        // Create TV show cards with enhanced data
        enhancedShows.forEach(show => {
            const showCard = createTVShowCard(show);
            container.appendChild(showCard);
        });
    } catch (error) {
        console.error('Error enhancing TV show data:', error);
        
        // Fallback to original data if enhancement fails
        container.innerHTML = '';
        shows.slice(0, 10).forEach(show => {
            const showCard = createTVShowCard(show);
            container.appendChild(showCard);
        });
    }
}

/**
 * Creates a movie card element
 * @param {Object} movie - Movie data
 * @returns {HTMLElement} - Movie card element
 */
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const tmdbRating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : '?';
    
    // OMDB enhanced data
    const imdbRating = movie.imdbRating || '';
    const rated = movie.rated || '';
    const runtime = movie.runtime || '';
    const director = movie.director || '';
    const hasOmdbData = movie.omdb && movie.omdb.Response === 'True';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}">
            ${rated ? `<span class="content-rating">${rated}</span>` : ''}
        </div>
        <div class="movie-details">
            <h3>${movie.title}</h3>
            <div class="movie-meta">
                <span class="year">${releaseYear}</span>
                <span class="rating tmdb-rating"><i class="fas fa-star"></i> ${tmdbRating}</span>
                ${imdbRating ? `<span class="rating imdb-rating"><i class="fab fa-imdb"></i> ${imdbRating}</span>` : ''}
                ${runtime ? `<span class="runtime"><i class="fas fa-clock"></i> ${runtime}</span>` : ''}
            </div>
            <p class="movie-overview">${movie.overview.substring(0, 80)}...</p>
            ${director ? `<p class="director"><strong>Director:</strong> ${director}</p>` : ''}
            <div class="card-actions">
                <button class="watch-btn"><i class="fas fa-play"></i> Watch Now</button>
                ${hasOmdbData ? `<button class="info-btn"><i class="fas fa-info-circle"></i> Details</button>` : ''}
            </div>
            ${hasOmdbData ? `<div class="omdb-badge" title="Enhanced with OMDB data">OMDB</div>` : ''}
        </div>
    `;
    
    // Add event listener for the info button if OMDB data is available
    if (hasOmdbData) {
        const infoBtn = card.querySelector('.info-btn');
        infoBtn.addEventListener('click', () => {
            showMovieDetails(movie);
        });
    }
    
    return card;
}

/**
 * Shows detailed movie information in a modal
 * @param {Object} movie - Enhanced movie data
 */
function showMovieDetails(movie) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    
    const omdb = movie.omdb || {};
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <div class="modal-poster">
                    <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}">
                </div>
                <div class="modal-title">
                    <h2>${movie.title} <span class="year">(${releaseYear})</span></h2>
                    <div class="modal-meta">
                        ${omdb.Rated ? `<span class="rated">${omdb.Rated}</span>` : ''}
                        ${omdb.Runtime ? `<span class="runtime">${omdb.Runtime}</span>` : ''}
                        ${omdb.Genre ? `<span class="genre">${omdb.Genre}</span>` : ''}
                        ${omdb.Released ? `<span class="release-date">Released: ${omdb.Released}</span>` : ''}
                    </div>
                    <div class="ratings">
                        ${omdb.imdbRating ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fab fa-imdb"></i> IMDb</span>
                                <span class="rating-value">${omdb.imdbRating}/10</span>
                                <span class="rating-count">${omdb.imdbVotes} votes</span>
                            </div>
                        ` : ''}
                        ${movie.vote_average ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fas fa-film"></i> TMDB</span>
                                <span class="rating-value">${movie.vote_average}/10</span>
                                <span class="rating-count">${movie.vote_count} votes</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <div class="plot">
                    <h3>Plot</h3>
                    <p>${omdb.Plot || movie.overview}</p>
                </div>
                <div class="details-grid">
                    ${omdb.Director && omdb.Director !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Director</h4>
                            <p>${omdb.Director}</p>
                        </div>
                    ` : ''}
                    ${omdb.Writer && omdb.Writer !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Writer</h4>
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
                    ${omdb.BoxOffice && omdb.BoxOffice !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Box Office</h4>
                            <p>${omdb.BoxOffice}</p>
                        </div>
                    ` : ''}
                    ${omdb.Production && omdb.Production !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Production</h4>
                            <p>${omdb.Production}</p>
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
 * Creates a TV show card element
 * @param {Object} show - TV show data
 * @returns {HTMLElement} - TV show card element
 */
function createTVShowCard(show) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
    const tmdbRating = show.vote_average ? (show.vote_average / 2).toFixed(1) : '?';
    
    // OMDB enhanced data
    const imdbRating = show.imdbRating || '';
    const rated = show.rated || '';
    const totalSeasons = show.totalSeasons ? `${show.totalSeasons} Seasons` : '';
    const hasOmdbData = show.omdb && show.omdb.Response === 'True';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(show.poster_path)}" alt="${show.name}">
            ${rated ? `<span class="content-rating">${rated}</span>` : ''}
        </div>
        <div class="movie-details">
            <h3>${show.name}</h3>
            <div class="movie-meta">
                <span class="year">${firstAirYear}</span>
                <span class="rating tmdb-rating"><i class="fas fa-star"></i> ${tmdbRating}</span>
                ${imdbRating ? `<span class="rating imdb-rating"><i class="fab fa-imdb"></i> ${imdbRating}</span>` : ''}
                ${totalSeasons ? `<span class="seasons"><i class="fas fa-film"></i> ${totalSeasons}</span>` : ''}
            </div>
            <p class="movie-overview">${show.overview.substring(0, 80)}...</p>
            <div class="card-actions">
                <button class="watch-btn"><i class="fas fa-play"></i> Watch Now</button>
                ${hasOmdbData ? `<button class="info-btn"><i class="fas fa-info-circle"></i> Details</button>` : ''}
            </div>
            ${hasOmdbData ? `<div class="omdb-badge" title="Enhanced with OMDB data">OMDB</div>` : ''}
        </div>
    `;
    
    // Add event listener for the info button if OMDB data is available
    if (hasOmdbData) {
        const infoBtn = card.querySelector('.info-btn');
        infoBtn.addEventListener('click', () => {
            showTVShowDetails(show);
        });
    }
    
    return card;
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
                        ${omdb.Runtime ? `<span class="runtime">${omdb.Runtime}</span>` : ''}
                        ${omdb.Genre ? `<span class="genre">${omdb.Genre}</span>` : ''}
                        ${omdb.totalSeasons ? `<span class="seasons">${omdb.totalSeasons} Seasons</span>` : ''}
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
                    ${omdb.Year ? `
                        <div class="detail-item">
                            <h4>Year</h4>
                            <p>${omdb.Year}</p>
                        </div>
                    ` : ''}
                    ${omdb.Country && omdb.Country !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Country</h4>
                            <p>${omdb.Country}</p>
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
 * Renders genre filter buttons
 * @param {Array} genres - Array of genre objects
 */
function renderGenreFilters(genres) {
    if (!genreFiltersContainer) return;
    
    // Clear existing filters except "All" button
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
 * @param {Event} event - Click event
 */
async function handleGenreFilter(event) {
    const genreId = event.target.getAttribute('data-genre');
    
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
        await renderMovies(movies, trendingMoviesContainer);
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

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions for potential reuse
export {
    initApp,
    renderMovies,
    renderTVShows,
    handleGenreFilter,
    createMovieCard,
    createTVShowCard,
    showMovieDetails,
    showTVShowDetails
};