# OMDB API Integration for CineView

This document outlines the integration of the OMDB (Open Movie Database) API into the CineView streaming platform to enhance movie and TV show data.

## Overview

The OMDB API has been integrated to provide additional metadata for movies and TV shows, including:

- IMDb ratings and votes
- Content ratings (PG, PG-13, R, etc.)
- Runtime information
- Director and cast details
- Awards information
- Box office performance
- Production details
- Plot summaries
- And more

## Implementation Details

### API Configuration

The OMDB API is configured in `src/js/api.js` with the following parameters:

```javascript
// OMDB API Configuration
const OMDB_API_KEY = '8c2a3c0b'; // Replace with your actual OMDB API key if needed
const OMDB_BASE_URL = 'https://www.omdbapi.com';
```

### Key Functions

The following functions have been implemented to interact with the OMDB API:

1. `fetchFromOMDB(params)` - Base function to fetch data from OMDB API
2. `getMovieDetailsByTitle(title, year)` - Get movie details by title and optional year
3. `getMovieDetailsByImdbId(imdbId)` - Get movie details by IMDb ID
4. `getTVShowDetailsByTitle(title, year)` - Get TV show details by title and optional year
5. `searchOMDB(query, type)` - Search for movies or TV shows
6. `getEnhancedMovieDetails(tmdbMovie)` - Enhance TMDB movie data with OMDB data
7. `getEnhancedTVShowDetails(tmdbShow)` - Enhance TMDB TV show data with OMDB data

### Integration Points

The OMDB API has been integrated into the following pages:

1. **Home Page** (`index.html`)
   - Enhanced movie and TV show cards with additional metadata
   - Detailed movie/show information in modals

2. **Movies Page** (`movies.html`)
   - Enhanced movie listings with OMDB data
   - Search functionality using OMDB API
   - Detailed movie information modals

3. **TV Shows Page** (`tvshows.html`)
   - Enhanced TV show listings with OMDB data
   - Search functionality using OMDB API
   - Detailed TV show information modals

### New Files Created

1. `src/js/movies-omdb.js` - Handles OMDB integration for the movies page
2. `src/js/tvshows-omdb.js` - Handles OMDB integration for the TV shows page
3. `src/styles/omdb-integration.css` - Styling for OMDB-enhanced elements

## Visual Indicators

The following visual indicators have been added to show when content is enhanced with OMDB data:

1. **OMDB Badge** - A small badge appears on movie/show cards that have been enhanced with OMDB data
2. **IMDb Ratings** - Yellow IMDb ratings are displayed alongside TMDB ratings
3. **Content Ratings** - PG, PG-13, R, etc. are displayed on movie/show posters
4. **Enhanced Details** - Additional metadata in movie/show details modals

## Usage Examples

### Fetching Movie Details

```javascript
// Get movie details by title
const movieDetails = await getMovieDetailsByTitle('The Matrix', 1999);

// Get movie details by IMDb ID
const movieDetails = await getMovieDetailsByImdbId('tt0133093');
```

### Enhancing TMDB Data

```javascript
// Get enhanced movie data
const tmdbMovie = await getTrendingMovies();
const enhancedMovie = await getEnhancedMovieDetails(tmdbMovie.results[0]);

// Access enhanced data
console.log(enhancedMovie.imdbRating); // IMDb rating
console.log(enhancedMovie.director);   // Director
console.log(enhancedMovie.rated);      // Content rating
```

### Searching OMDB

```javascript
// Search for movies
const movieResults = await searchOMDB('Matrix', 'movie');

// Search for TV shows
const tvResults = await searchOMDB('Breaking Bad', 'series');
```

## API Limitations

Please be aware of the following OMDB API limitations:

1. The free tier of OMDB API is limited to 1,000 requests per day
2. Some older or obscure titles may have incomplete data
3. TV show episode-specific information requires additional API calls

## Future Enhancements

Potential future enhancements for the OMDB integration:

1. Caching mechanism to reduce API calls
2. Offline fallback for previously fetched OMDB data
3. Integration with additional pages (search.html, mylist.html)
4. Enhanced filtering based on OMDB-specific fields (awards, ratings, etc.)
5. User ratings comparison between TMDB and IMDb