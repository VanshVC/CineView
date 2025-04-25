/**
 * CineVerse Movies Module
 * Handles movie-specific functionality
 */

// DOM Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const movieCards = document.querySelectorAll('.movie-card');
const searchBtn = document.querySelector('.search-btn');
const searchContainer = document.getElementById('searchContainer');
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Movie Filtering
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get selected genre
        const genre = button.getAttribute('data-filter');
        
        // Filter movies
        movieCards.forEach(card => {
            if (genre === 'all') {
                card.style.display = 'block';
                // Add small delay for animation
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                if (card.getAttribute('data-genre') === genre) {
                    card.style.display = 'block';
                    // Add small delay for animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    // Hide after animation
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// Search Functionality
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSearchContainer();
});

// Close search when clicking outside
document.addEventListener('click', (e) => {
    if (searchContainer.classList.contains('active') && 
        !searchContainer.contains(e.target) && 
        e.target !== searchBtn) {
        toggleSearchContainer(false);
    }
});

// Close search with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
        toggleSearchContainer(false);
    }
});

// Handle search form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
        await performSearch(query);
    }
});

/**
 * Toggle search container visibility
 * @param {boolean} [show] - Force show/hide state
 */
function toggleSearchContainer(show) {
    const isActive = searchContainer.classList.contains('active');
    
    if (show === undefined) {
        show = !isActive;
    }
    
    if (show) {
        searchContainer.classList.add('active');
        searchInput.focus();
    } else {
        searchContainer.classList.remove('active');
        // Clear results when closing
        setTimeout(() => {
            searchResults.innerHTML = '';
        }, 300);
    }
}

/**
 * Perform search and display results
 * @param {string} query - Search query
 */
async function performSearch(query) {
    // Show loading indicator
    searchResults.innerHTML = '<div class="search-loading"><div class="spinner"></div><p>Searching...</p></div>';
    
    try {
        // Get search results from API
        const results = await apiService.search(query);
        
        // Display results
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found for your search.</div>';
        } else {
            displaySearchResults(results);
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="search-error">An error occurred while searching. Please try again.</div>';
    }
}

/**
 * Display search results in the search container
 * @param {Array} results - Search results
 */
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        resultItem.innerHTML = `
            <div class="search-result-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="search-result-info">
                <h3 class="search-result-title">${item.title}</h3>
                <div class="search-result-meta">
                    <span>${item.year}</span>
                    <span><i class="fas fa-star"></i> ${item.rating}</span>
                </div>
            </div>
        `;
        
        // Add click event to navigate to the item details
        resultItem.addEventListener('click', () => {
            if (item.type === 'movie') {
                window.location.href = `movie-details.html?id=${item.id}`;
            } else {
                window.location.href = `tvshow-details.html?id=${item.id}`;
            }
        });
        
        searchResults.appendChild(resultItem);
    });
}

// Initialize specific movie page functions
function initMoviePage() {
    // Lazy load movie images
    const movieImages = document.querySelectorAll('.movie-poster img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('src');
                    
                    img.style.opacity = '0';
                    
                    // Set image source and apply fade-in effect
                    img.onload = () => {
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = '1';
                    };
                    
                    img.src = src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        movieImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize the movie page functionality
document.addEventListener('DOMContentLoaded', initMoviePage); 