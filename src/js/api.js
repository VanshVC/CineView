// TMDB API Configuration
const TMDB_API_KEY = 'f18b06b7432016e820090ea70929e0db';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes for TMDB
const BACKDROP_SIZE = 'w1280';
const POSTER_SIZE = 'w500';

// OMDB API Configuration
const OMDB_API_KEY = '6c3a2d45'; // Using a different API key
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Log OMDB API configuration
console.log('OMDB API configured with key:', OMDB_API_KEY);

/**
 * Fetches data from TMDB API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - JSON response
 */
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        ...params
    });
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data from TMDB:', error);
        return null;
    }
}

/**
 * Fetches data from OMDB API
 * @param {Object} params - Query parameters (title, imdbID, etc.)
 * @returns {Promise} - JSON response
 */
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

/**
 * Get full image URL from TMDB
 * @param {string} path - Image path from API
 * @param {string} size - Image size (backdrop or poster)
 * @returns {string} - Complete image URL
 */
function getImageUrl(path, size = POSTER_SIZE) {
    if (!path) {
        return 'src/images/placeholder.jpg'; // Fallback image
    }
    return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Fetches trending movies
 * @param {string} timeWindow - 'day' or 'week'
 * @returns {Promise} - JSON response with trending movies
 */
async function getTrendingMovies(timeWindow = 'week') {
    return await fetchFromTMDB(`/trending/movie/${timeWindow}`);
}

/**
 * Fetches popular TV shows
 * @returns {Promise} - JSON response with popular TV shows
 */
async function getPopularTVShows() {
    return await fetchFromTMDB('/tv/popular');
}

/**
 * Fetches movies by genre
 * @param {number} genreId - Genre ID
 * @returns {Promise} - JSON response with movies of specified genre
 */
async function getMoviesByGenre(genreId) {
    return await fetchFromTMDB('/discover/movie', {
        with_genres: genreId,
        sort_by: 'popularity.desc'
    });
}

/**
 * Fetches all movie genres
 * @returns {Promise} - JSON response with all movie genres
 */
async function getMovieGenres() {
    return await fetchFromTMDB('/genre/movie/list');
}

/**
 * Searches for movies and TV shows
 * @param {string} query - Search query
 * @returns {Promise} - JSON response with search results
 */
async function searchMulti(query) {
    if (!query) return null;
    
    return await fetchFromTMDB('/search/multi', {
        query: query
    });
}

/**
 * Fetches detailed movie information from OMDB by title
 * @param {string} title - Movie title
 * @param {number} year - Optional release year for more accurate results
 * @returns {Promise} - JSON response with movie details
 */
async function getMovieDetailsByTitle(title, year = null) {
    const params = { t: title, type: 'movie' };
    
    if (year) {
        params.y = year;
    }
    
    return await fetchFromOMDB(params);
}

/**
 * Fetches detailed movie information from OMDB by IMDb ID
 * @param {string} imdbId - IMDb ID
 * @returns {Promise} - JSON response with movie details
 */
async function getMovieDetailsByImdbId(imdbId) {
    return await fetchFromOMDB({ i: imdbId });
}

/**
 * Fetches detailed TV show information from OMDB by title
 * @param {string} title - TV show title
 * @param {number} year - Optional first air year for more accurate results
 * @returns {Promise} - JSON response with TV show details
 */
async function getTVShowDetailsByTitle(title, year = null) {
    const params = { t: title, type: 'series' };
    
    if (year) {
        params.y = year;
    }
    
    return await fetchFromOMDB(params);
}

/**
 * Searches OMDB for movies or TV shows
 * @param {string} query - Search query
 * @param {string} type - Type of content ('movie', 'series', or 'episode')
 * @returns {Promise} - JSON response with search results
 */
async function searchOMDB(query, type = '') {
    const params = { s: query };
    
    if (type) {
        params.type = type;
    }
    
    return await fetchFromOMDB(params);
}

/**
 * Fetches movie details from both TMDB and OMDB for enhanced information
 * @param {Object} tmdbMovie - Movie data from TMDB
 * @returns {Promise} - Enhanced movie object with data from both APIs
 */
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

/**
 * Fetches TV show details from both TMDB and OMDB for enhanced information
 * @param {Object} tmdbShow - TV show data from TMDB
 * @returns {Promise} - Enhanced TV show object with data from both APIs
 */
async function getEnhancedTVShowDetails(tmdbShow) {
    if (!tmdbShow) {
        console.warn('getEnhancedTVShowDetails: No TMDB show data provided');
        return null;
    }
    
    console.log('Enhancing TV show details for:', tmdbShow.name);
    
    try {
        const year = tmdbShow.first_air_date ? new Date(tmdbShow.first_air_date).getFullYear() : null;
        console.log(`Fetching OMDB data for "${tmdbShow.name}" (${year})`);
        
        const omdbData = await getTVShowDetailsByTitle(tmdbShow.name, year);
        console.log('OMDB data received:', omdbData);
        
        if (omdbData && omdbData.Response === 'True') {
            console.log('Successfully enhanced TV show with OMDB data');
            
            const enhancedShow = {
                ...tmdbShow,
                omdb: omdbData,
                // Merged fields for easier access
                imdbRating: omdbData.imdbRating,
                imdbVotes: omdbData.imdbVotes,
                imdbID: omdbData.imdbID,
                rated: omdbData.Rated,
                totalSeasons: omdbData.totalSeasons,
                runtime: omdbData.Runtime,
                creator: omdbData.Writer,
                actors: omdbData.Actors,
                awards: omdbData.Awards
            };
            
            return enhancedShow;
        } else {
            console.warn(`No OMDB data found for "${tmdbShow.name}"`);
            if (omdbData && omdbData.Error) {
                console.warn('OMDB Error:', omdbData.Error);
            }
            return tmdbShow;
        }
    } catch (error) {
        console.error('Error enhancing TV show details:', error);
        return tmdbShow;
    }
}

// Export all functions
export {
    fetchFromTMDB,
    fetchFromOMDB,
    getImageUrl,
    getTrendingMovies,
    getPopularTVShows,
    getMoviesByGenre,
    getMovieGenres,
    searchMulti,
    getMovieDetailsByTitle,
    getMovieDetailsByImdbId,
    getTVShowDetailsByTitle,
    searchOMDB,
    getEnhancedMovieDetails,
    getEnhancedTVShowDetails,
    TMDB_API_KEY,
    TMDB_BASE_URL,
    OMDB_API_KEY,
    OMDB_BASE_URL,
    IMAGE_BASE_URL,
    BACKDROP_SIZE,
    POSTER_SIZE
};