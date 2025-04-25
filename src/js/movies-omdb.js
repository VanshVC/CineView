import {
    getImageUrl,
    getMovieDetailsByTitle,
    getMovieDetailsByImdbId,
    searchOMDB,
    getEnhancedMovieDetails,
    getMoviesByGenre,
    getMovieGenres
} from './api.js';

// DOM Elements
const moviesContainer = document.querySelector('.movies-slider');
const genreFilters = document.querySelectorAll('.filter-btn');
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading content...</p>';

// Initialize the movies page
async function initMoviesPage() {
    console.log('Initializing movies page with OMDB integration');
    
    // Add loading indicator
    document.body.appendChild(loadingIndicator);
    
    try {
        // Test OMDB API connection first
        console.log('Testing OMDB API connection...');
        const testResult = await getMovieDetailsByTitle('The Matrix');
        console.log('OMDB API test result:', testResult);
        
        if (testResult && testResult.Response === 'True') {
            console.log('OMDB API connection successful');
        } else {
            console.warn('OMDB API connection failed or returned an error:', testResult);
            showErrorMessage('OMDB API connection issue. Some enhanced features may not be available.');
        }
        
        // Load genres for filtering
        console.log('Loading movie genres...');
        const genresData = await getMovieGenres();
        if (genresData && genresData.genres) {
            console.log('Genres loaded successfully:', genresData.genres.length, 'genres');
            updateGenreFilters(genresData.genres);
        } else {
            console.warn('Failed to load genres or no genres returned');
        }
        
        // Load initial movies (popular movies)
        console.log('Loading popular movies...');
        const popularMovies = await getMoviesByGenre('all');
        if (popularMovies && popularMovies.results) {
            console.log('Popular movies loaded successfully:', popularMovies.results.length, 'movies');
            await renderEnhancedMovies(popularMovies.results);
        } else {
            console.warn('Failed to load popular movies or no movies returned');
            showErrorMessage('Failed to load movies. Please try again later.');
        }
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing movies page:', error);
        showErrorMessage('Failed to load movies. Please try again later.');
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
    }
}

/**
 * Updates genre filter buttons with actual genres from API
 * @param {Array} genres - Array of genre objects
 */
function updateGenreFilters(genres) {
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;
    
    // Keep the "All" button
    filterContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';
    
    // Add genre buttons (limit to 8 to avoid overcrowding)
    genres.slice(0, 8).forEach(genre => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', genre.id);
        button.textContent = genre.name;
        filterContainer.appendChild(button);
    });
    
    // Re-attach event listeners to new buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleGenreFilter);
    });
}

/**
 * Renders enhanced movie cards with OMDB data
 * @param {Array} movies - Array of movie objects
 */
async function renderEnhancedMovies(movies) {
    if (!moviesContainer) {
        console.error('Movies container not found in the DOM');
        return;
    }
    
    console.log('Rendering enhanced movies:', movies.length, 'movies');
    
    // Clear existing content
    moviesContainer.innerHTML = '';
    
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-state';
    loadingElement.innerHTML = '<div class="spinner"></div><p>Enhancing movie data with OMDB...</p>';
    moviesContainer.appendChild(loadingElement);
    
    try {
        // Process movies in batches to avoid overwhelming the API
        const enhancedMovies = [];
        const batchSize = 3;
        let successCount = 0;
        let failureCount = 0;
        
        console.log(`Processing movies in batches of ${batchSize}`);
        
        for (let i = 0; i < Math.min(movies.length, 12); i += batchSize) {
            const batch = movies.slice(i, i + batchSize);
            console.log(`Processing batch ${i/batchSize + 1} with ${batch.length} movies`);
            
            try {
                const batchPromises = batch.map(movie => getEnhancedMovieDetails(movie));
                const batchResults = await Promise.all(batchPromises);
                
                // Count successful enhancements
                batchResults.forEach(movie => {
                    if (movie && movie.omdb && movie.omdb.Response === 'True') {
                        successCount++;
                    } else {
                        failureCount++;
                    }
                });
                
                enhancedMovies.push(...batchResults);
                console.log(`Batch ${i/batchSize + 1} processed successfully`);
            } catch (batchError) {
                console.error(`Error processing batch ${i/batchSize + 1}:`, batchError);
                // Add the original movies as fallback
                enhancedMovies.push(...batch);
                failureCount += batch.length;
            }
        }
        
        // Clear loading state
        moviesContainer.innerHTML = '';
        
        console.log(`Enhancement complete: ${successCount} successful, ${failureCount} failed`);
        
        if (successCount === 0 && failureCount > 0) {
            console.warn('No movies were successfully enhanced with OMDB data');
            showErrorMessage('OMDB data enhancement failed. Showing basic movie data instead.');
        }
        
        // Create movie cards with enhanced data
        enhancedMovies.forEach(movie => {
            if (movie && movie.omdb && movie.omdb.Response === 'True') {
                const movieCard = createEnhancedMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            } else {
                const movieCard = createBasicMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            }
        });
        
        // Add a notice about OMDB integration status
        const statusElement = document.createElement('div');
        statusElement.className = 'omdb-status';
        statusElement.style.textAlign = 'center';
        statusElement.style.padding = '10px';
        statusElement.style.marginTop = '20px';
        statusElement.style.color = '#aaa';
        statusElement.style.fontSize = '0.9rem';
        
        if (successCount > 0) {
            statusElement.innerHTML = `<i class="fas fa-info-circle"></i> ${successCount} of ${enhancedMovies.length} movies enhanced with OMDB data`;
        } else {
            statusElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> OMDB data enhancement unavailable. Check console for details.`;
        }
        
        moviesContainer.parentNode.appendChild(statusElement);
        
    } catch (error) {
        console.error('Error enhancing movie data:', error);
        
        // Fallback to original data if enhancement fails
        moviesContainer.innerHTML = '';
        movies.slice(0, 12).forEach(movie => {
            const movieCard = createBasicMovieCard(movie);
            moviesContainer.appendChild(movieCard);
        });
        
        showErrorMessage('Failed to enhance movies with OMDB data. Showing basic movie data instead.');
    }
}

/**
 * Creates an enhanced movie card with OMDB data
 * @param {Object} movie - Enhanced movie data
 * @returns {HTMLElement} - Movie card element
 */
function createEnhancedMovieCard(movie) {
    if (!movie) {
        console.error('Cannot create card: Movie data is null or undefined');
        return document.createElement('div'); // Return empty div as fallback
    }
    
    console.log('Creating enhanced movie card for:', movie.title);
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-genre', movie.genre_ids ? movie.genre_ids[0] : '');
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const tmdbRating = movie.vote_average ? movie.vote_average.toFixed(1) : '?';
    
    // OMDB enhanced data
    const imdbRating = movie.imdbRating || '';
    const rated = movie.rated || '';
    const runtime = movie.runtime || '';
    const director = movie.director || '';
    const hasOmdbData = movie.omdb && movie.omdb.Response === 'True';
    
    // Safely get movie overview
    const overview = movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available';
    
    // Safely get movie title
    const title = movie.title || 'Untitled Movie';
    
    // Safely get poster path
    const posterPath = movie.poster_path || '';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(posterPath)}" alt="${title}">
            ${rated ? `<span class="content-rating">${rated}</span>` : ''}
            <div class="movie-details">
                <h3>${title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating"><i class="fas fa-star"></i> ${tmdbRating}</span>
                    ${imdbRating ? `<span class="movie-rating imdb-rating"><i class="fab fa-imdb"></i> ${imdbRating}</span>` : ''}
                    <span class="movie-year">${releaseYear}</span>
                    ${runtime ? `<span class="runtime"><i class="fas fa-clock"></i> ${runtime}</span>` : ''}
                </div>
                <p class="movie-desc">${overview}</p>
                ${director ? `<p class="director"><strong>Director:</strong> ${director}</p>` : ''}
                <div class="card-actions">
                    <button class="watch-btn"><i class="fas fa-play"></i> Watch Now</button>
                    ${hasOmdbData ? `<button class="info-btn"><i class="fas fa-info-circle"></i> Details</button>` : ''}
                </div>
                ${hasOmdbData ? `<div class="omdb-badge" title="Enhanced with OMDB data">OMDB</div>` : ''}
            </div>
        </div>
    `;
    
    // Add event listener for the info button if OMDB data is available
    if (hasOmdbData) {
        const infoBtn = card.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => {
                showMovieDetails(movie);
            });
        }
    }
    
    return card;
}

/**
 * Creates a basic movie card without OMDB data (fallback)
 * @param {Object} movie - Basic movie data
 * @returns {HTMLElement} - Movie card element
 */
function createBasicMovieCard(movie) {
    if (!movie) {
        console.error('Cannot create card: Movie data is null or undefined');
        return document.createElement('div'); // Return empty div as fallback
    }
    
    console.log('Creating basic movie card for:', movie.title || 'Unknown movie');
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-genre', movie.genre_ids ? movie.genre_ids[0] : '');
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '?';
    
    // Safely get movie overview
    const overview = movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available';
    
    // Safely get movie title
    const title = movie.title || 'Untitled Movie';
    
    // Safely get poster path
    const posterPath = movie.poster_path || '';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${getImageUrl(posterPath)}" alt="${title}">
            <div class="movie-details">
                <h3>${title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="movie-year">${releaseYear}</span>
                </div>
                <p class="movie-desc">${overview}</p>
                <button class="watch-btn"><i class="fas fa-play"></i> Watch Now</button>
            </div>
        </div>
    `;
    
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
 * Handles genre filter button clicks
 * @param {Event} event - Click event
 */
async function handleGenreFilter(event) {
    const genreId = event.target.getAttribute('data-filter');
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show loading indicator
    document.body.appendChild(loadingIndicator);
    
    try {
        // Fetch movies by selected genre
        const data = await getMoviesByGenre(genreId);
        
        if (data && data.results) {
            // Render enhanced movies
            await renderEnhancedMovies(data.results);
        }
    } catch (error) {
        console.error('Error filtering by genre:', error);
        showErrorMessage('Failed to load movies for this genre. Please try again.');
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
    }
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
        // Search OMDB for movies
        const results = await searchOMDB(query, 'movie');
        
        if (results && results.Response === 'True' && results.Search) {
            displaySearchResults(results.Search);
        } else {
            searchResults.innerHTML = '<p class="no-results">No results found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error searching movies:', error);
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
        // Get detailed movie info from OMDB
        const detailedInfo = await getMovieDetailsByImdbId(result.imdbID);
        
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
                    ${detailedInfo && detailedInfo.Runtime !== 'N/A' ? 
                        `<span class="result-runtime"><i class="fas fa-clock"></i> ${detailedInfo.Runtime}</span>` : ''}
                </div>
                ${detailedInfo && detailedInfo.Plot !== 'N/A' ? 
                    `<p class="result-plot">${detailedInfo.Plot.substring(0, 100)}...</p>` : ''}
                <button class="view-details-btn" data-imdbid="${result.imdbID}">View Details</button>
            </div>
        `;
        
        // Add event listener to view details button
        const viewDetailsBtn = resultItem.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', async () => {
            const movie = await getMovieDetailsByImdbId(result.imdbID);
            if (movie && movie.Response === 'True') {
                showOMDBMovieDetails(movie);
            }
        });
        
        searchResults.appendChild(resultItem);
    });
}

/**
 * Shows detailed movie information from OMDB in a modal
 * @param {Object} movie - OMDB movie data
 */
function showOMDBMovieDetails(movie) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'movie-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <div class="modal-poster">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'src/images/placeholder.jpg'}" alt="${movie.Title}">
                </div>
                <div class="modal-title">
                    <h2>${movie.Title} <span class="year">(${movie.Year})</span></h2>
                    <div class="modal-meta">
                        ${movie.Rated !== 'N/A' ? `<span class="rated">${movie.Rated}</span>` : ''}
                        ${movie.Runtime !== 'N/A' ? `<span class="runtime">${movie.Runtime}</span>` : ''}
                        ${movie.Genre !== 'N/A' ? `<span class="genre">${movie.Genre}</span>` : ''}
                        ${movie.Released !== 'N/A' ? `<span class="release-date">Released: ${movie.Released}</span>` : ''}
                    </div>
                    <div class="ratings">
                        ${movie.imdbRating !== 'N/A' ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fab fa-imdb"></i> IMDb</span>
                                <span class="rating-value">${movie.imdbRating}/10</span>
                                <span class="rating-count">${movie.imdbVotes} votes</span>
                            </div>
                        ` : ''}
                        ${movie.Metascore !== 'N/A' ? `
                            <div class="rating-item">
                                <span class="rating-source"><i class="fas fa-chart-bar"></i> Metascore</span>
                                <span class="rating-value">${movie.Metascore}/100</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <div class="plot">
                    <h3>Plot</h3>
                    <p>${movie.Plot !== 'N/A' ? movie.Plot : 'Plot information not available.'}</p>
                </div>
                <div class="details-grid">
                    ${movie.Director !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Director</h4>
                            <p>${movie.Director}</p>
                        </div>
                    ` : ''}
                    ${movie.Writer !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Writer</h4>
                            <p>${movie.Writer}</p>
                        </div>
                    ` : ''}
                    ${movie.Actors !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Cast</h4>
                            <p>${movie.Actors}</p>
                        </div>
                    ` : ''}
                    ${movie.Awards !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Awards</h4>
                            <p>${movie.Awards}</p>
                        </div>
                    ` : ''}
                    ${movie.BoxOffice !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Box Office</h4>
                            <p>${movie.BoxOffice}</p>
                        </div>
                    ` : ''}
                    ${movie.Production !== 'N/A' ? `
                        <div class="detail-item">
                            <h4>Production</h4>
                            <p>${movie.Production}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="watch-btn primary-btn"><i class="fas fa-play"></i> Watch Now</button>
                <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" class="imdb-link">
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
    // Genre filter buttons
    genreFilters.forEach(button => {
        button.addEventListener('click', handleGenreFilter);
    });
    
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
}

/**
 * Shows error message to the user
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    console.warn('Showing error message:', message);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.position = 'fixed';
    errorElement.style.top = '20px';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translateX(-50%)';
    errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorElement.style.color = 'white';
    errorElement.style.padding = '15px 20px';
    errorElement.style.borderRadius = '5px';
    errorElement.style.zIndex = '10000';
    errorElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    errorElement.style.fontWeight = 'bold';
    errorElement.style.textAlign = 'center';
    errorElement.style.maxWidth = '80%';
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>${message}`;
    
    document.body.appendChild(errorElement);
    
    // Remove error message after 8 seconds
    setTimeout(() => {
        if (document.body.contains(errorElement)) {
            document.body.removeChild(errorElement);
        }
    }, 8000);
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initMoviesPage);

// Export functions for potential reuse
export {
    initMoviesPage,
    renderEnhancedMovies,
    showMovieDetails,
    handleGenreFilter,
    handleSearch
};