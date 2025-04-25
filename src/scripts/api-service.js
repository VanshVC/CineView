/**
 * CineVerse API Service
 * This file has been deprecated and replaced by local-data-service.js
 */

class ApiService {
    constructor() {
        console.log('ApiService has been replaced with LocalDataService');
    }

    /**
     * Get the full image URL from TMDB
     * @param {string} path - Image path
     * @param {string} size - Image size (w500, original, etc.)
     * @returns {string} Full image URL
     */
    getImageUrl(path, size = 'w500') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${this.IMAGE_BASE_URL}${size}${path}`;
    }

    /**
     * Fetch data from TMDB API
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async fetchFromTMDB(endpoint, params = {}) {
        const queryParams = new URLSearchParams({
            api_key: this.API_KEY,
            ...params
        });
        
        const url = `${this.BASE_URL}${endpoint}?${queryParams}`;
        console.log('Fetching from TMDB:', url);
        
        try {
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(`API request failed: ${errorData.status_message || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response Data:', data);
            return data;
        } catch (error) {
            console.error('TMDB API Error:', error);
            throw error;
        }
    }

    /**
     * Get trending movies and TV shows
     * @param {string} mediaType - 'movie', 'tv', or 'all'
     * @param {string} timeWindow - 'day' or 'week'
     * @returns {Promise<Array>} Trending items
     */
    async getTrending(mediaType = 'all', timeWindow = 'week') {
        const data = await this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
        return data.results.map(item => this.formatMediaItem(item));
    }

    /**
     * Search for movies and TV shows
     * @param {string} query - Search query
     * @param {string} type - 'movie', 'tv', or 'multi'
     * @returns {Promise<Array>} Search results
     */
    async search(query, type = 'multi') {
        if (!query) return [];
        
        const data = await this.fetchFromTMDB(`/search/${type}`, {
            query,
            include_adult: false,
            language: 'en-US',
            page: 1
        });
        
        return data.results.map(item => this.formatMediaItem(item));
    }

    /**
     * Get movie or TV show details
     * @param {string} id - Item ID
     * @param {string} type - 'movie' or 'tv'
     * @returns {Promise<Object>} Item details
     */
    async getDetails(id, type) {
        const data = await this.fetchFromTMDB(`/${type}/${id}`, {
            append_to_response: 'videos,credits,similar,recommendations'
        });
        return this.formatMediaItem(data, true);
    }

    /**
     * Get movies or TV shows by genre
     * @param {string} type - 'movie' or 'tv'
     * @param {number} genreId - Genre ID
     * @returns {Promise<Array>} List of items
     */
    async getByGenre(type, genreId) {
        const data = await this.fetchFromTMDB(`/discover/${type}`, {
            with_genres: genreId,
            sort_by: 'popularity.desc'
        });
        return data.results.map(item => this.formatMediaItem(item));
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
                tagline: item.tagline,
                runtime: item.runtime || (item.episode_run_time ? item.episode_run_time[0] : null),
                genres: item.genres,
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
     * Get genre list
     * @param {string} type - 'movie' or 'tv'
     * @returns {Promise<Array>} List of genres
     */
    async getGenres(type) {
        const data = await this.fetchFromTMDB(`/genre/${type}/list`);
        return data.genres;
    }
}

// Create a global instance of the API service
const apiService = new ApiService(); 