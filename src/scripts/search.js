// Search Page Script

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mainSearchForm = document.getElementById('mainSearchForm');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const genreFilter = document.getElementById('genreFilter');
    const yearFilter = document.getElementById('yearFilter');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const searchResultsCount = document.getElementById('searchResultsCount');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginCloseBtn = document.getElementById('loginCloseBtn');
    const signupCloseBtn = document.getElementById('signupCloseBtn');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    // Store search results for filtering
    let searchResults = [];
    let isSearching = false;

    // Search Params State
    let searchState = {
        query: '',
        type: 'all',
        genre: 'all',
        year: 'all'
    };

    // Initialize Page
    function init() {
        // Check URL params for search query
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        
        if (queryParam) {
            mainSearchInput.value = queryParam;
            searchState.query = queryParam;
            performSearch();
        } else {
            showEmptyState();
        }

        // Add event listeners
        bindEventListeners();
    }

    // Bind event listeners to DOM elements
    function bindEventListeners() {
        // Search form submission
        mainSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchState.query = mainSearchInput.value.trim();
            
            if (searchState.query.length < 2) return;
            
            // Update URL with search query
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('q', searchState.query);
            window.history.pushState({}, '', newUrl);
            
            performSearch();
        });

        // Type filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update search state
                searchState.type = this.dataset.filter;
                
                // Apply filters to existing results
                if (searchResults.length > 0) {
                    applyFilters();
                }
            });
        });

        // Genre filter change
        genreFilter.addEventListener('change', function() {
            searchState.genre = this.value;
            if (searchResults.length > 0) {
                applyFilters();
            }
        });

        // Year filter change
        yearFilter.addEventListener('change', function() {
            searchState.year = this.value;
            if (searchResults.length > 0) {
                applyFilters();
            }
        });

        // Modal handling
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'block';
        });
        
        signupBtn.addEventListener('click', function() {
            signupModal.style.display = 'block';
        });
        
        loginCloseBtn.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
        
        signupCloseBtn.addEventListener('click', function() {
            signupModal.style.display = 'none';
        });
        
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
        });
        
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === signupModal) {
                signupModal.style.display = 'none';
            }
        });
    }

    // Perform OMDB API search
    async function performSearch() {
        if (isSearching || searchState.query.length < 2) return;
        
        try {
            isSearching = true;
            
            // Show loading state
            showLoadingState();
            
            // Search for movies
            const movieResults = await ApiService.searchMedia(searchState.query, 'movie');
            
            // Search for TV shows
            const tvResults = await ApiService.searchMedia(searchState.query, 'series');
            
            // Combine results
            let combinedResults = [];
            
            // Process movie results
            if (movieResults && movieResults.Search) {
                const movieDetailsPromises = movieResults.Search.map(result => ApiService.getDetailsByImdbID(result.imdbID));
                const movies = await Promise.all(movieDetailsPromises);
                
                // Add content type
                movies.forEach(movie => {
                    if (movie) movie.contentType = 'movie';
                });
                
                combinedResults = combinedResults.concat(movies.filter(movie => movie !== null));
            }
            
            // Process TV show results
            if (tvResults && tvResults.Search) {
                const tvDetailsPromises = tvResults.Search.map(result => ApiService.getDetailsByImdbID(result.imdbID));
                const tvShows = await Promise.all(tvDetailsPromises);
                
                // Add content type
                tvShows.forEach(show => {
                    if (show) show.contentType = 'tvshow';
                });
                
                combinedResults = combinedResults.concat(tvShows.filter(show => show !== null));
            }
            
            // Store results for filtering
            searchResults = combinedResults;
            
            // Apply filters and display results
            applyFilters();
            
        } catch (error) {
            console.error('Search error:', error);
            showErrorMessage('An error occurred while searching. Please try again.');
            hideLoadingState();
            if (searchResults.length === 0) {
                showEmptyState();
            }
        } finally {
            isSearching = false;
        }
    }
    
    // Apply filters to search results
    function applyFilters() {
        if (!searchResults || searchResults.length === 0) {
            hideLoadingState();
            showEmptyState();
            return;
        }
        
        // Filter results based on current search state
        let filteredResults = searchResults;
        
        // Filter by type
        if (searchState.type !== 'all') {
            filteredResults = filteredResults.filter(item => item.contentType === searchState.type);
        }
        
        // Filter by genre
        if (searchState.genre !== 'all') {
            filteredResults = filteredResults.filter(item => {
                if (!item.Genre) return false;
                return item.Genre.toLowerCase().includes(searchState.genre.toLowerCase());
            });
        }
        
        // Filter by year
        if (searchState.year !== 'all') {
            if (searchState.year === 'older') {
                // 2019 and older
                filteredResults = filteredResults.filter(item => {
                    const year = parseInt(item.Year);
                    return year <= 2019;
                });
            } else {
                // Specific year
                const filterYear = searchState.year;
                filteredResults = filteredResults.filter(item => {
                    if (item.Year.includes('–')) {
                        // TV show with year range
                        const startYear = parseInt(item.Year.split('–')[0]);
                        return startYear.toString() === filterYear;
                    } else {
                        // Movie with specific year
                        return item.Year === filterYear;
                    }
                });
            }
        }
        
        // Display filtered results
        displayResults(filteredResults);
    }

    // Display search results
    function displayResults(results) {
        // Hide loading state
        hideLoadingState();
        
        // Clear existing results
        searchResultsGrid.innerHTML = '';
        
        // Update results count
        searchResultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
        
        // Show no results message if needed
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No matches found</h3>
                <p>Try adjusting your filters or search for a different term</p>
            `;
            searchResultsGrid.appendChild(noResults);
            return;
        }
        
        // Create result items
        results.forEach(item => {
            const resultItem = createResultItem(item);
            searchResultsGrid.appendChild(resultItem);
        });
        
        // Hide empty state
        hideEmptyState();
        
        // Add result card styles if not already added
        if (!document.getElementById('result-card-styles')) {
            addResultCardStyles();
        }
    }

    // Create a result item
    function createResultItem(item) {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.setAttribute('data-type', item.contentType);
        
        // Handle poster image
        const poster = item.Poster && item.Poster !== 'N/A' 
            ? item.Poster 
            : 'https://via.placeholder.com/300x450?text=No+Poster+Available';
        
        // Format rating
        const rating = item.imdbRating && item.imdbRating !== 'N/A' 
            ? parseFloat(item.imdbRating).toFixed(1) 
            : '7.5';
        
        // Format plot (truncate if too long)
        const plot = item.Plot && item.Plot !== 'N/A' 
            ? (item.Plot.length > 100 ? item.Plot.substring(0, 97) + '...' : item.Plot) 
            : 'No description available.';
        
        // Format genre display
        const genres = item.Genre ? item.Genre.split(',').slice(0, 2).join(', ') : '';
        
        resultCard.innerHTML = `
            <div class="result-poster">
                <img src="${poster}" alt="${item.Title}">
                <div class="result-type">${item.contentType === 'movie' ? 'Movie' : 'TV Show'}</div>
            </div>
            <div class="result-details">
                <h3>${item.Title}</h3>
                <div class="result-meta">
                    <span class="result-year">${item.Year}</span>
                    <span class="result-rating"><i class="fas fa-star"></i> ${rating}</span>
                    ${item.Runtime && item.Runtime !== 'N/A' ? `<span class="result-runtime">${item.Runtime}</span>` : ''}
                </div>
                <div class="result-genres">${genres}</div>
                <p class="result-desc">${plot}</p>
                <div class="result-actions">
                    <button class="watch-btn" data-imdbid="${item.imdbID}"><i class="fas fa-play"></i> Watch Now</button>
                    <button class="add-to-list-btn" data-imdbid="${item.imdbID}" data-title="${item.Title}"><i class="fas fa-plus"></i> Add to My List</button>
                </div>
            </div>
        `;
        
        return resultCard;
    }

    // Show empty state
    function showEmptyState() {
        emptyState.style.display = 'flex';
        searchResultsCount.textContent = '';
    }

    // Hide empty state
    function hideEmptyState() {
        emptyState.style.display = 'none';
    }

    // Show loading state
    function showLoadingState() {
        loadingState.style.display = 'flex';
        searchResultsGrid.innerHTML = '';
        searchResultsCount.textContent = 'Searching...';
    }

    // Hide loading state
    function hideLoadingState() {
        loadingState.style.display = 'none';
    }
    
    /**
     * Show error message toast
     */
    function showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'feedback-toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
    
    // Add result card styles if not already added
    function addResultCardStyles() {
        if (document.getElementById('result-card-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'result-card-styles';
        style.textContent = `
            .result-card {
                display: flex;
                margin-bottom: 1.5rem;
                background-color: rgba(26, 26, 58, 0.5);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .result-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }
            
            .result-poster {
                flex: 0 0 150px;
                position: relative;
            }
            
            .result-poster img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .result-type {
                position: absolute;
                top: 10px;
                left: 10px;
                background-color: rgba(255, 0, 255, 0.8);
                color: white;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .result-details {
                flex: 1;
                padding: 15px;
                display: flex;
                flex-direction: column;
            }
            
            .result-details h3 {
                margin: 0 0 8px 0;
                font-size: 18px;
            }
            
            .result-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .result-rating {
                color: #00FFFF;
            }
            
            .result-genres {
                font-size: 13px;
                color: #ccc;
                margin-bottom: 10px;
            }
            
            .result-desc {
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 15px;
                flex-grow: 1;
            }
            
            .result-actions {
                display: flex;
                gap: 10px;
            }
            
            .no-results {
                text-align: center;
                padding: 40px 0;
                width: 100%;
            }
            
            .no-results i {
                font-size: 40px;
                color: rgba(255, 255, 255, 0.3);
                margin-bottom: 15px;
            }
            
            .no-results h3 {
                margin: 0 0 10px 0;
                font-size: 22px;
            }
            
            .no-results p {
                color: #ccc;
            }
            
            @media screen and (max-width: 768px) {
                .result-card {
                    flex-direction: column;
                }
                
                .result-poster {
                    height: 200px;
                }
                
                .result-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize the page
    init();
}); 