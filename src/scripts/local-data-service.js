/**
 * CineVerse Local Data Service
 * Provides movie and TV show data from local sample data
 */

class LocalDataService {
    constructor() {
        this.FALLBACK_POSTER = 'https://via.placeholder.com/500x750?text=No+Image';
        console.log('LocalDataService initialized');
        
        // Load sample data
        this.loadSampleData();
    }

    /**
     * Load sample data from the sample-movies.js file
     */
    loadSampleData() {
        // These variables should be defined in sample-movies.js
        this.trendingMovies = window.SAMPLE_TRENDING_MOVIES || { results: [] };
        this.tvShows = window.SAMPLE_TV_SHOWS || { results: [] };
        this.genres = window.SAMPLE_GENRES || { genres: [] };
        
        console.log('Sample data loaded:', {
            movies: this.trendingMovies.results.length,
            tvShows: this.tvShows.results.length,
            genres: this.genres.genres ? this.genres.genres.length : 0
        });
    }

    /**
     * Get the full image URL
     * @param {string} path - Image path
     * @param {string} size - Image size (not used, kept for compatibility)
     * @returns {string} Full image URL
     */
    getImageUrl(path, size = 'w500') {
        if (!path) return this.FALLBACK_POSTER;
        
        // If path is a full URL, return it as is
        if (path.startsWith('http')) {
            return path;
        }
        
        // For local development, we'll just use the path as is
        // In a real app, you might want to serve images from a local folder
        return path;
    }

    /**
     * Get trending movies and TV shows
     * @param {string} mediaType - 'movie', 'tv', or 'all'
     * @param {string} timeWindow - 'day' or 'week' (not used, kept for compatibility)
     * @returns {Promise<Array>} Trending items
     */
    async getTrending(mediaType = 'all', timeWindow = 'week') {
        let results = [];
        
        if (mediaType === 'movie' || mediaType === 'all') {
            results = [...results, ...this.trendingMovies.results];
        }
        
        if (mediaType === 'tv' || mediaType === 'all') {
            results = [...results, ...this.tvShows.results];
        }
        
        return results.map(item => this.formatMediaItem(item));
    }

    /**
     * Search for movies and TV shows
     * @param {string} query - Search query
     * @param {string} type - 'movie', 'tv', or 'multi'
     * @returns {Promise<Array>} Search results
     */
    async search(query, type = 'multi') {
        if (!query) return [];
        
        const normalizedQuery = query.toLowerCase();
        let results = [];
        
        if (type === 'movie' || type === 'multi') {
            const movieResults = this.trendingMovies.results.filter(movie => 
                movie.title.toLowerCase().includes(normalizedQuery) || 
                (movie.overview && movie.overview.toLowerCase().includes(normalizedQuery))
            );
            results = [...results, ...movieResults];
        }
        
        if (type === 'tv' || type === 'multi') {
            const tvResults = this.tvShows.results.filter(show => 
                show.name.toLowerCase().includes(normalizedQuery) || 
                (show.overview && show.overview.toLowerCase().includes(normalizedQuery))
            );
            results = [...results, ...tvResults];
        }
        
        return results.map(item => this.formatMediaItem(item));
    }

    /**
     * Get movie or TV show details
     * @param {string} id - Item ID
     * @param {string} type - 'movie' or 'tv'
     * @returns {Promise<Object>} Item details
     */
    async getDetails(id, type) {
        let item = null;
        
        if (type === 'movie') {
            item = this.trendingMovies.results.find(movie => movie.id === parseInt(id));
        } else if (type === 'tv') {
            item = this.tvShows.results.find(show => show.id === parseInt(id));
        }
        
        if (!item) {
            console.error(`Item not found: ${type} ${id}`);
            return null;
        }
        
        // Add some mock detailed data
        item.videos = { results: [] };
        item.credits = { 
            cast: [],
            crew: []
        };
        item.similar = { results: [] };
        item.recommendations = { results: [] };
        
        return this.formatMediaItem(item, true);
    }

    /**
     * Get movies or TV shows by genre
     * @param {string} type - 'movie' or 'tv'
     * @param {number} genreId - Genre ID
     * @returns {Promise<Array>} List of items
     */
    async getByGenre(type, genreId) {
        const genreIdNum = parseInt(genreId);
        let results = [];
        
        if (type === 'movie') {
            results = this.trendingMovies.results.filter(movie => 
                movie.genre_ids && movie.genre_ids.includes(genreIdNum)
            );
        } else if (type === 'tv') {
            results = this.tvShows.results.filter(show => 
                show.genre_ids && show.genre_ids.includes(genreIdNum)
            );
        }
        
        return results.map(item => this.formatMediaItem(item));
    }

    /**
     * Format media item data
     * @param {Object} item - Raw item data
     * @param {boolean} detailed - Whether to include detailed information
     * @returns {Object} Formatted item data
     */
    formatMediaItem(item, detailed = false) {
        const baseItem = {
            id: item.id,
            title: item.title || item.name,
            type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
            posterPath: this.getImageUrl(item.poster_path),
            backdropPath: this.getImageUrl(item.backdrop_path, 'original'),
            overview: item.overview,
            rating: item.vote_average,
            releaseDate: item.release_date || item.first_air_date,
            genreIds: item.genre_ids || (item.genres ? item.genres.map(g => g.id) : [])
        };

        if (detailed) {
            return {
                ...baseItem,
                tagline: item.tagline || '',
                runtime: item.runtime || (item.episode_run_time ? item.episode_run_time[0] : 120),
                genres: item.genres || this.getGenresFromIds(item.genre_ids),
                videos: item.videos?.results || [],
                cast: item.credits?.cast || [],
                crew: item.credits?.crew || [],
                similar: item.similar?.results.map(i => this.formatMediaItem(i)) || [],
                recommendations: item.recommendations?.results.map(i => this.formatMediaItem(i)) || []
            };
        }

        return baseItem;
    }

    /**
     * Get genre objects from genre IDs
     * @param {Array} genreIds - Array of genre IDs
     * @returns {Array} Array of genre objects
     */
    getGenresFromIds(genreIds) {
        if (!genreIds || !genreIds.length) return [];
        
        return genreIds.map(id => {
            const genre = this.genres.genres.find(g => g.id === id);
            return genre || { id, name: 'Unknown' };
        });
    }

    /**
     * Get genre list
     * @param {string} type - 'movie' or 'tv'
     * @returns {Promise<Array>} List of genres
     */
    async getGenres(type) {
        return this.genres.genres || [];
    }
}

// Create a global instance of the local data service
const apiService = new LocalDataService();