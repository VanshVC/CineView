/**
 * CineView My List Module
 * Handles user's saved content list
 */

// Initialize API Service
const api = new ApiService();

// Initialize User Manager
const userManager = window.userManager || new UserManager();

// DOM Elements
const myListContent = document.getElementById('myListContent');
const emptyList = document.getElementById('emptyList');
const sortBySelect = document.getElementById('sort-by');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize My List
function initializeMyList() {
    // Check if user is logged in
    if (!userManager.currentUser) {
        // Show empty list with login message
        showEmptyList('Please log in to view your list', true);
        return;
    }
    
    // Get watchlist from user
    const watchlist = userManager.currentUser.watchlist || [];
    
    // Check if watchlist is empty
    if (watchlist.length === 0) {
        showEmptyList('Your list is empty', false);
        return;
    }
    
    // Render watchlist
    renderWatchlist(watchlist);
    
    // Initialize sort and filter
    initializeSortAndFilter();
}

// Show empty list message
function showEmptyList(message, showLoginButton) {
    if (!emptyList) return;
    
    emptyList.innerHTML = `
        <div class="empty-content">
            <i class="fas fa-folder-open fa-4x"></i>
            <h2>${message}</h2>
            <p>Add movies and TV shows to your list by clicking the "+" button on any title</p>
            ${showLoginButton ? 
                '<button class="browse-btn" id="loginPromptBtn">Log In</button>' : 
                '<a href="index.html" class="browse-btn">Browse Content</a>'
            }
        </div>
    `;
    
    emptyList.style.display = 'flex';
    
    if (myListContent) {
        myListContent.style.display = 'none';
    }
    
    // Add event listener to login button
    const loginPromptBtn = document.getElementById('loginPromptBtn');
    if (loginPromptBtn) {
        loginPromptBtn.addEventListener('click', () => {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }
}

// Render watchlist
function renderWatchlist(watchlist) {
    if (!myListContent) return;
    
    // Show content grid
    myListContent.style.display = 'grid';
    
    if (emptyList) {
        emptyList.style.display = 'none';
    }
    
    // Clear existing content
    myListContent.innerHTML = '';
    
    // Add each item to the grid
    watchlist.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.setAttribute('data-type', item.type);
        card.setAttribute('data-id', item.id);
        
        // Format date
        const addedDate = new Date(item.addedAt);
        const formattedDate = addedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Create card HTML
        card.innerHTML = `
            <div class="card-image">
                <img src="${item.posterPath}" alt="${item.title}">
                <div class="card-overlay">
                    <div class="card-actions">
                        <button class="play-btn" onclick="playContent('${item.id}', '${item.type}')">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="remove-btn" data-id="${item.id}" data-type="${item.type}">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-info">
                <h3 class="title">${item.title}</h3>
                <div class="meta-info">
                    <span class="date">Added: ${formattedDate}</span>
                    <span class="type">Type: ${item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    <span class="rating"><i class="fas fa-star"></i> ${item.rating.toFixed(1)}</span>
                </div>
            </div>
        `;
        
        myListContent.appendChild(card);
    });
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            removeFromWatchlist(id, type);
        });
    });
}

// Initialize sort and filter
function initializeSortAndFilter() {
    // Sort select change event
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            sortWatchlist(sortBySelect.value);
        });
    }
    
    // Filter buttons click event
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Filter watchlist
                filterWatchlist(btn.getAttribute('data-filter'));
            });
        });
    }
}

// Sort watchlist
function sortWatchlist(sortBy) {
    if (!userManager.currentUser || !userManager.currentUser.watchlist) return;
    
    const watchlist = [...userManager.currentUser.watchlist];
    
    switch (sortBy) {
        case 'date-added':
            watchlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
            break;
        case 'alphabetical':
            watchlist.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'rating':
            watchlist.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    renderWatchlist(watchlist);
    
    // Re-apply current filter
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
        filterWatchlist(activeFilter.getAttribute('data-filter'));
    }
}

// Filter watchlist
function filterWatchlist(filter) {
    if (!myListContent) return;
    
    const cards = myListContent.querySelectorAll('.content-card');
    
    cards.forEach(card => {
        const type = card.getAttribute('data-type');
        
        if (filter === 'all' || 
            (filter === 'movies' && type === 'movie') || 
            (filter === 'tvshows' && type === 'tv')) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Remove from watchlist
function removeFromWatchlist(id, type) {
    if (!userManager.currentUser) return;
    
    // Confirm removal
    if (confirm('Are you sure you want to remove this from your list?')) {
        userManager.removeFromWatchlist(id, type);
        
        // Re-initialize list
        initializeMyList();
    }
}

// Play content
function playContent(id, type) {
    window.location.href = `index.html?play=${type}_${id}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeMyList();
});

// Export functions for global access
window.playContent = playContent;
window.removeFromWatchlist = removeFromWatchlist; 