/**
 * CineView User Manager
 * Handles user authentication, profiles, and preferences
 */

class UserManager {
    constructor() {
        // Initialize user data
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || {};
        this.watchlist = JSON.parse(localStorage.getItem('watchlist')) || {};
        
        // Initialize if first time
        if (this.users.length === 0) {
            this.initializeDefaultUsers();
        }
        
        console.log('UserManager initialized:', {
            userCount: this.users.length,
            isLoggedIn: !!this.currentUser
        });
    }
    
    // Initialize default users for demo
    initializeDefaultUsers() {
        const defaultUser = {
            id: this.generateId(),
            name: 'Demo User',
            email: 'demo@example.com',
            password: 'password',
            createdAt: new Date().toISOString(),
            plan: 'standard',
            profiles: [
                {
                    id: this.generateId(),
                    name: 'Demo User',
                    avatar: 'https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABTYctxxbe-UkKEdlMxXm4FVGD6DqTHkQ0TQ5CQJ9jbOMnG0CYxYcSICcTUQz8DrB7CpKUGpqJVMtEqksLlvSJx2ac3Xk.png',
                    isKids: false,
                    isActive: true
                }
            ],
            preferences: {
                autoplay: true,
                previews: true,
                dataUsage: 'auto',
                maturityLevel: 'all',
                subtitles: false,
                language: 'en'
            },
            watchlist: [],
            ratings: {}
        };
        
        this.users.push(defaultUser);
        this.saveUsers();
    }
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    // Save current user to localStorage
    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    
    // Save watch history to localStorage
    saveWatchHistory() {
        localStorage.setItem('watchHistory', JSON.stringify(this.watchHistory));
    }
    
    // Save watchlist to localStorage
    saveWatchlist() {
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
    }
    
    // Register new user
    register(userData) {
        // Check if email already exists
        if (this.users.some(user => user.email === userData.email)) {
            throw new Error('Email already in use');
        }
        
        // Create new user
        const newUser = {
            id: this.generateId(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            createdAt: new Date().toISOString(),
            plan: userData.plan || 'basic',
            profiles: [
                {
                    id: this.generateId(),
                    name: userData.name,
                    avatar: 'https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABTYctxxbe-UkKEdlMxXm4FVGD6DqTHkQ0TQ5CQJ9jbOMnG0CYxYcSICcTUQz8DrB7CpKUGpqJVMtEqksLlvSJx2ac3Xk.png',
                    isKids: false,
                    isActive: true
                }
            ],
            preferences: {
                autoplay: true,
                previews: true,
                dataUsage: 'auto',
                maturityLevel: 'all',
                subtitles: false,
                language: 'en'
            },
            watchlist: [],
            ratings: {}
        };
        
        // Add user to users array
        this.users.push(newUser);
        
        // Save users
        this.saveUsers();
        
        // Set as current user
        this.currentUser = newUser;
        this.saveCurrentUser();
        
        // Initialize watch history for user
        this.watchHistory[newUser.id] = [];
        this.saveWatchHistory();
        
        return newUser;
    }
    
    // Login user
    login(email, password) {
        // Find user
        const user = this.users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        // Set as current user
        this.currentUser = user;
        this.saveCurrentUser();
        
        return user;
    }
    
    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    // Update user
    updateUser(userData) {
        if (!this.currentUser) return;
        
        // Find user index
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        
        if (userIndex === -1) return;
        
        // Update user
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        
        // Update current user
        this.currentUser = this.users[userIndex];
        
        // Save changes
        this.saveUsers();
        this.saveCurrentUser();
        
        return this.currentUser;
    }
    
    // Update user preferences
    updatePreferences(preferences) {
        if (!this.currentUser) return;
        
        // Update preferences
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        
        // Update user
        return this.updateUser(this.currentUser);
    }
    
    // Get active profile
    getActiveProfile() {
        if (!this.currentUser || !this.currentUser.profiles) return null;
        
        return this.currentUser.profiles.find(profile => profile.isActive) || this.currentUser.profiles[0];
    }
    
    // Get profile by ID
    getProfile(profileId) {
        if (!this.currentUser || !this.currentUser.profiles) return null;
        
        return this.currentUser.profiles.find(profile => profile.id === profileId);
    }
    
    // Add profile
    addProfile(profileData) {
        if (!this.currentUser) return;
        
        // Check if max profiles reached
        if (this.currentUser.profiles && this.currentUser.profiles.length >= 5) {
            throw new Error('Maximum number of profiles reached');
        }
        
        // Create new profile
        const newProfile = {
            id: this.generateId(),
            name: profileData.name,
            avatar: profileData.avatar || 'https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABTYctxxbe-UkKEdlMxXm4FVGD6DqTHkQ0TQ5CQJ9jbOMnG0CYxYcSICcTUQz8DrB7CpKUGpqJVMtEqksLlvSJx2ac3Xk.png',
            isKids: profileData.isKids || false,
            isActive: false
        };
        
        // Add profile to user
        if (!this.currentUser.profiles) {
            this.currentUser.profiles = [];
        }
        
        this.currentUser.profiles.push(newProfile);
        
        // Update user
        this.updateUser(this.currentUser);
        
        return newProfile;
    }
    
    // Update profile
    updateProfile(profileId, profileData) {
        if (!this.currentUser || !this.currentUser.profiles) return;
        
        // Find profile index
        const profileIndex = this.currentUser.profiles.findIndex(profile => profile.id === profileId);
        
        if (profileIndex === -1) return;
        
        // Update profile
        this.currentUser.profiles[profileIndex] = { 
            ...this.currentUser.profiles[profileIndex], 
            ...profileData 
        };
        
        // Update user
        this.updateUser(this.currentUser);
        
        return this.currentUser.profiles[profileIndex];
    }
    
    // Delete profile
    deleteProfile(profileId) {
        if (!this.currentUser || !this.currentUser.profiles) return;
        
        // Check if it's the only profile
        if (this.currentUser.profiles.length <= 1) {
            throw new Error('Cannot delete the only profile');
        }
        
        // Find profile
        const profile = this.currentUser.profiles.find(profile => profile.id === profileId);
        
        if (!profile) return;
        
        // If deleting active profile, set first profile as active
        if (profile.isActive) {
            const remainingProfiles = this.currentUser.profiles.filter(p => p.id !== profileId);
            remainingProfiles[0].isActive = true;
        }
        
        // Remove profile
        this.currentUser.profiles = this.currentUser.profiles.filter(profile => profile.id !== profileId);
        
        // Update user
        this.updateUser(this.currentUser);
    }
    
    // Set active profile
    setActiveProfile(profileId) {
        if (!this.currentUser || !this.currentUser.profiles) return;
        
        // Reset all profiles
        this.currentUser.profiles.forEach(profile => {
            profile.isActive = false;
        });
        
        // Set active profile
        const profile = this.currentUser.profiles.find(profile => profile.id === profileId);
        
        if (profile) {
            profile.isActive = true;
        }
        
        // Update user
        this.updateUser(this.currentUser);
    }
    
    // Add to watch history
    addToWatchHistory(mediaItem, progress = 0) {
        if (!this.currentUser) return;
        
        const userId = this.currentUser.id;
        
        // Initialize watch history for user if not exists
        if (!this.watchHistory[userId]) {
            this.watchHistory[userId] = [];
        }
        
        // Check if item already in watch history
        const existingIndex = this.watchHistory[userId].findIndex(
            item => item.id === mediaItem.id && item.type === mediaItem.type
        );
        
        const historyItem = {
            id: mediaItem.id,
            type: mediaItem.type,
            title: mediaItem.title,
            posterPath: mediaItem.posterPath || mediaItem.poster_path,
            progress: progress,
            lastWatched: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            // Update existing item
            this.watchHistory[userId][existingIndex] = {
                ...this.watchHistory[userId][existingIndex],
                ...historyItem
            };
        } else {
            // Add new item
            this.watchHistory[userId].unshift(historyItem);
            
            // Limit history to 100 items
            if (this.watchHistory[userId].length > 100) {
                this.watchHistory[userId] = this.watchHistory[userId].slice(0, 100);
            }
        }
        
        // Save watch history
        this.saveWatchHistory();
        
        return historyItem;
    }
    
    // Get watch history
    getWatchHistory(limit = 0) {
        if (!this.currentUser) return [];
        
        const userId = this.currentUser.id;
        
        // Get watch history for user
        const history = this.watchHistory[userId] || [];
        
        // Sort by last watched
        const sortedHistory = [...history].sort(
            (a, b) => new Date(b.lastWatched) - new Date(a.lastWatched)
        );
        
        // Limit if specified
        return limit > 0 ? sortedHistory.slice(0, limit) : sortedHistory;
    }
    
    // Get continue watching
    getContinueWatching() {
        if (!this.currentUser) return [];
        
        // Get watch history
        const history = this.getWatchHistory();
        
        // Filter items that are in progress (between 5% and 90%)
        return history.filter(item => item.progress >= 5 && item.progress < 90);
    }
    
    // Add to watchlist
    addToWatchlist(mediaItem) {
        if (!this.currentUser) return;
        
        // Initialize watchlist if not exists
        if (!this.currentUser.watchlist) {
            this.currentUser.watchlist = [];
        }
        
        // Check if already in watchlist
        const existingIndex = this.currentUser.watchlist.findIndex(
            item => item.id === mediaItem.id && item.type === mediaItem.type
        );
        
        if (existingIndex !== -1) {
            return; // Already in watchlist
        }
        
        // Add to watchlist
        const watchlistItem = {
            id: mediaItem.id,
            type: mediaItem.type,
            title: mediaItem.title,
            posterPath: mediaItem.posterPath || mediaItem.poster_path,
            rating: mediaItem.rating || mediaItem.vote_average || 0,
            addedAt: new Date().toISOString()
        };
        
        this.currentUser.watchlist.unshift(watchlistItem);
        
        // Update user
        this.updateUser(this.currentUser);
        
        return watchlistItem;
    }
    
    // Remove from watchlist
    removeFromWatchlist(id, type) {
        if (!this.currentUser || !this.currentUser.watchlist) return;
        
        // Remove from watchlist
        this.currentUser.watchlist = this.currentUser.watchlist.filter(
            item => !(item.id === id && item.type === type)
        );
        
        // Update user
        this.updateUser(this.currentUser);
    }
    
    // Rate content
    rateContent(id, type, rating) {
        if (!this.currentUser) return;
        
        // Initialize ratings if not exists
        if (!this.currentUser.ratings) {
            this.currentUser.ratings = {};
        }
        
        // Add rating
        this.currentUser.ratings[`${type}_${id}`] = {
            rating,
            timestamp: new Date().toISOString()
        };
        
        // Update user
        this.updateUser(this.currentUser);
    }
    
    // Get content rating
    getContentRating(id, type) {
        if (!this.currentUser || !this.currentUser.ratings) return null;
        
        return this.currentUser.ratings[`${type}_${id}`] || null;
    }
}

// Initialize UserManager globally
window.UserManager = UserManager;
window.userManager = new UserManager();