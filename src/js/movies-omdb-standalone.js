// OMDB API Configuration
const OMDB_API_KEY = '6c3a2d45'; // Using the same key as in api.js
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const POSTER_SIZE = 'w500';

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
function initMoviesPage() {
    console.log('Initializing movies page with OMDB integration (standalone version)');
    
    // Add loading indicator
    document.body.appendChild(loadingIndicator);
    
    // Test OMDB API connection
    testOMDBConnection()
        .then(isConnected => {
            if (isConnected) {
                console.log('OMDB API connection successful');
                // Continue with initialization
                return loadMovies();
            } else {
                console.warn('OMDB API connection failed');
                showErrorMessage('OMDB API connection issue. Some enhanced features may not be available.');
                // Continue with basic initialization
                return loadMovies(false);
            }
        })
        .catch(error => {
            console.error('Error initializing movies page:', error);
            showErrorMessage('Failed to load movies. Please try again later.');
            document.body.removeChild(loadingIndicator);
        });
}

// Test OMDB API connection
async function testOMDBConnection() {
    try {
        console.log('Testing OMDB API connection...');
        const testResult = await getMovieDetailsByTitle('The Matrix');
        console.log('OMDB API test result:', testResult);
        
        return testResult && testResult.Response === 'True';
    } catch (error) {
        console.error('OMDB API connection test failed:', error);
        return false;
    }
}

// Load movies
async function loadMovies(useOMDB = true) {
    try {
        // Create a sample movie list for testing
        const sampleMovies = [
            {
                title: 'The Matrix',
                overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                release_date: '1999-03-30',
                vote_average: 8.2,
                genre_ids: [28, 878]
            },
            {
                title: 'Inception',
                overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                release_date: '2010-07-16',
                vote_average: 8.4,
                genre_ids: [28, 878, 12]
            },
            {
                title: 'The Shawshank Redemption',
                overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                release_date: '1994-09-23',
                vote_average: 8.7,
                genre_ids: [18, 80]
            }
        ];
        
        // Render movies
        if (useOMDB) {
            await renderEnhancedMovies(sampleMovies);
        } else {
            renderBasicMovies(sampleMovies);
        }
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showErrorMessage('Failed to load movies. Please try again later.');
    } finally {
        // Remove loading indicator
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
    }
}

// Render enhanced movies
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
        // Process movies one by one
        const enhancedMovies = [];
        let successCount = 0;
        let failureCount = 0;
        
        for (const movie of movies) {
            try {
                const enhancedMovie = await getEnhancedMovieDetails(movie);
                
                if (enhancedMovie && enhancedMovie.omdb && enhancedMovie.omdb.Response === 'True') {
                    successCount++;
                } else {
                    failureCount++;
                }
                
                enhancedMovies.push(enhancedMovie);
            } catch (movieError) {
                console.error(`Error enhancing movie ${movie.title}:`, movieError);
                enhancedMovies.push(movie);
                failureCount++;
            }
        }
        
        // Clear loading state
        moviesContainer.innerHTML = '';
        
        console.log(`Enhancement complete: ${successCount} successful, ${failureCount} failed`);
        
        // Create movie cards
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
        
        if (moviesContainer.parentNode) {
            moviesContainer.parentNode.appendChild(statusElement);
        }
        
    } catch (error) {
        console.error('Error enhancing movie data:', error);
        
        // Fallback to basic rendering
        renderBasicMovies(movies);
        
        showErrorMessage('Failed to enhance movies with OMDB data. Showing basic movie data instead.');
    }
}

// Render basic movies
function renderBasicMovies(movies) {
    if (!moviesContainer) {
        console.error('Movies container not found in the DOM');
        return;
    }
    
    console.log('Rendering basic movies:', movies.length, 'movies');
    
    // Clear existing content
    moviesContainer.innerHTML = '';
    
    // Create movie cards
    movies.forEach(movie => {
        const movieCard = createBasicMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });
}

// Create enhanced movie card
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

// Create basic movie card
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

// Show movie details
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
                                <span class="rating-count">${movie.vote_count || '0'} votes</span>
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
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add event listeners for genre filters if they exist
    if (genreFilters) {
        genreFilters.forEach(button => {
            button.addEventListener('click', handleGenreFilter);
        });
    }
    
    // Add event listener for search form if it exists
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

// Handle genre filter
function handleGenreFilter(event) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // In a real implementation, this would filter movies by genre
    // For this standalone version, we'll just show a message
    showErrorMessage('Genre filtering is not implemented in the standalone version');
}

// Handle search
function handleSearch(event) {
    event.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    // In a real implementation, this would search for movies
    // For this standalone version, we'll just show a message
    showErrorMessage('Search is not implemented in the standalone version');
}

// Get image URL
function getImageUrl(path, size = POSTER_SIZE) {
    if (!path) {
        return 'src/images/placeholder.jpg'; // Fallback image
    }
    
    // Check if the path is already a full URL
    if (path.startsWith('http')) {
        return path;
    }
    
    return `${IMAGE_BASE_URL}/${size}${path}`;
}

// Fetch from OMDB API
async function fetchFromOMDB(params = {}) {
    const queryParams = new URLSearchParams({
        apikey: OMDB_API_KEY,
        ...params
    });
    
    const url = `${OMDB_BASE_URL}?${queryParams}`;
    console.log('Fetching from OMDB API:', url);
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OMDB API Error Response:', errorText);
            throw new Error(`OMDB API Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('OMDB API Response:', data);
        
        if (data.Error) {
            console.warn('OMDB API returned an error:', data.Error);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching data from OMDB:', error);
        return { Response: 'False', Error: error.message };
    }
}

// Get movie details by title
async function getMovieDetailsByTitle(title, year = null) {
    const params = { t: title, type: 'movie' };
    
    if (year) {
        params.y = year;
    }
    
    return await fetchFromOMDB(params);
}

// Get enhanced movie details
async function getEnhancedMovieDetails(tmdbMovie) {
    if (!tmdbMovie) {
        console.warn('getEnhancedMovieDetails: No TMDB movie data provided');
        return null;
    }
    
    console.log('Enhancing movie details for:', tmdbMovie.title);
    
    try {
        const year = tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null;
        console.log(`Fetching OMDB data for "${tmdbMovie.title}" (${year})`);
        
        const omdbData = await getMovieDetailsByTitle(tmdbMovie.title, year);
        console.log('OMDB data received:', omdbData);
        
        if (omdbData && omdbData.Response === 'True') {
            console.log('Successfully enhanced movie with OMDB data');
            
            const enhancedMovie = {
                ...tmdbMovie,
                omdb: omdbData,
                // Merged fields for easier access
                imdbRating: omdbData.imdbRating,
                imdbVotes: omdbData.imdbVotes,
                imdbID: omdbData.imdbID,
                rated: omdbData.Rated,
                runtime: omdbData.Runtime,
                director: omdbData.Director,
                actors: omdbData.Actors,
                awards: omdbData.Awards,
                boxOffice: omdbData.BoxOffice,
                production: omdbData.Production
            };
            
            return enhancedMovie;
        } else {
            console.warn(`No OMDB data found for "${tmdbMovie.title}"`);
            if (omdbData && omdbData.Error) {
                console.warn('OMDB Error:', omdbData.Error);
            }
            return tmdbMovie;
        }
    } catch (error) {
        console.error('Error enhancing movie details:', error);
        return tmdbMovie;
    }
}

// Show error message
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initMoviesPage);