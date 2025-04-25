/**
 * CineVerse Authentication Module
 * Handles user authentication (login, signup, profile management)
 */

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginCloseBtn = document.getElementById('loginCloseBtn');
const signupCloseBtn = document.getElementById('signupCloseBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginError = document.getElementById('loginError');
const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification';
notificationContainer.className = 'notification';
notificationContainer.innerHTML = '<span id="notificationMessage"></span><span class="notification-close">&times;</span>';
document.body.appendChild(notificationContainer);
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const notificationClose = document.querySelector('.notification-close');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

// User data storage
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('cineverse_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('cineverse_current_user')) || null;
        
        // Initialize notification styles if not present
        this.addNotificationStyles();
        
        // Update UI based on authentication status
        this.updateAuthUI();
    }
    
    // Add notification styles if they don't exist
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 9999;
                    min-width: 300px;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                .notification.error {
                    background-color: #f44336;
                }
                .notification-close {
                    cursor: pointer;
                    margin-left: 10px;
                    font-weight: bold;
                }
                .form-error {
                    color: #f44336;
                    font-size: 14px;
                    margin-top: 5px;
                    margin-bottom: 10px;
                }
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    align-items: center;
                    justify-content: center;
                }
                .modal-content {
                    background-color: #fff;
                    color: #333;
                    max-width: 500px;
                    width: 90%;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .form-group {
                    margin-bottom: 1.2rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                .form-group input:focus, .form-group select:focus {
                    border-color: #9d4edd;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(157, 78, 221, 0.2);
                }
                .btn {
                    display: inline-block;
                    padding: 0.8rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    text-align: center;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s, transform 0.2s;
                }
                .btn-primary {
                    background-color: #9d4edd;
                    color: white;
                    width: 100%;
                }
                .btn-primary:hover {
                    background-color: #7b2cbf;
                    transform: translateY(-2px);
                }
                .close-modal {
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                .close-modal:hover {
                    color: #9d4edd;
                }
                .modal-footer {
                    text-align: center;
                    margin-top: 1.2rem;
                }
                .modal-footer a {
                    color: #9d4edd;
                    text-decoration: none;
                }
                .modal-footer a:hover {
                    text-decoration: underline;
                }
                .remember-me {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .remember-me input {
                    width: auto;
                    margin-right: 0.5rem;
                }
                .forgot-password {
                    color: #9d4edd;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .forgot-password:hover {
                    text-decoration: underline;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .modal.show {
                    animation: fadeIn 0.3s;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create a new user
    register(name, email, password, plan) {
        // Check if email already exists
        if (this.users.some(user => user.email === email)) {
            throw new Error('Email already registered');
        }
        
        // Create new user object
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // In a real app, this would be hashed
            plan,
            watchlist: [],
            preferences: {
                genres: [],
                language: 'en'
            },
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        this.users.push(newUser);
        
        // Save to localStorage
        this.saveUsers();
        
        // Set as current user
        this.setCurrentUser(newUser);
        
        return newUser;
    }
    
    // Login user
    login(email, password) {
        // Find user with matching email
        const user = this.users.find(user => user.email === email);
        
        // Check if user exists and password matches
        if (!user || user.password !== password) {
            throw new Error('Invalid email or password');
        }
        
        // Set as current user
        this.setCurrentUser(user);
        
        return user;
    }
    
    // Logout current user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('cineverse_current_user');
        this.updateAuthUI();
        
        // Show notification
        showNotification('You have been logged out.');
    }
    
    // Add movie/show to user's watchlist
    addToWatchlist(item) {
        if (!this.currentUser) return false;
        
        // Check if item is already in watchlist
        const exists = this.currentUser.watchlist.some(
            watchItem => watchItem.id === item.id && watchItem.type === item.type
        );
        
        if (!exists) {
            this.currentUser.watchlist.push({
                ...item,
                addedAt: new Date().toISOString()
            });
            
            this.updateUser(this.currentUser);
            return true;
        }
        
        return false;
    }
    
    // Remove from watchlist
    removeFromWatchlist(itemId, type) {
        if (!this.currentUser) return false;
        
        this.currentUser.watchlist = this.currentUser.watchlist.filter(
            item => !(item.id === itemId && item.type === type)
        );
        
        this.updateUser(this.currentUser);
        return true;
    }
    
    // Set current user and update localStorage
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('cineverse_current_user', JSON.stringify(user));
        this.updateAuthUI();
    }
    
    // Update existing user
    updateUser(updatedUser) {
        const index = this.users.findIndex(user => user.id === updatedUser.id);
        
        if (index !== -1) {
            this.users[index] = updatedUser;
            this.saveUsers();
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === updatedUser.id) {
                this.setCurrentUser(updatedUser);
            }
        }
    }
    
    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('cineverse_users', JSON.stringify(this.users));
    }
    
    // Update UI based on authentication status
    updateAuthUI() {
        const authButtons = document.querySelector('.nav-buttons');
        
        if (this.currentUser) {
            // User is logged in
            if (authButtons) {
                const firstInitial = this.currentUser.name.charAt(0).toUpperCase();
                
                authButtons.innerHTML = `
                    <button class="search-btn"><i class="fas fa-search"></i></button>
                    <div class="user-profile">
                        <div class="user-avatar">
                            <span>${firstInitial}</span>
                        </div>
                        <div class="user-dropdown">
                            <ul>
                                <li><a href="profile.html"><i class="fas fa-user"></i> My Profile</a></li>
                                <li><a href="mylist.html"><i class="fas fa-list"></i> My List</a></li>
                                <li><a href="settings.html"><i class="fas fa-cog"></i> Settings</a></li>
                                <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                            </ul>
                        </div>
                    </div>
                `;
                
                // Add style for user avatar if not exists
                this.addAvatarStyles();
                
                // Add event listener to logout button
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
                
                // Add event listener to user avatar for dropdown
                const userAvatar = document.querySelector('.user-avatar');
                if (userAvatar) {
                    userAvatar.addEventListener('click', () => {
                        document.querySelector('.user-dropdown').classList.toggle('active');
                    });
                    
                    // Close dropdown when clicking outside
                    document.addEventListener('click', (e) => {
                        const dropdown = document.querySelector('.user-dropdown');
                        if (dropdown && userAvatar && !userAvatar.contains(e.target) && !dropdown.contains(e.target)) {
                            dropdown.classList.remove('active');
                        }
                    });
                }
            }
            
            // Show user-specific content
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'block';
            });
            
            document.querySelectorAll('.guest-only').forEach(el => {
                el.style.display = 'none';
            });
        } else {
            // User is not logged in
            if (authButtons) {
                authButtons.innerHTML = `
                    <button class="search-btn"><i class="fas fa-search"></i></button>
                    <button class="login-btn" id="loginBtn">Log In</button>
                    <button class="signup-btn" id="signupBtn">Sign Up</button>
                `;
                
                // Re-attach event listeners for login/signup buttons
                const newLoginBtn = document.getElementById('loginBtn');
                const newSignupBtn = document.getElementById('signupBtn');
                
                if (newLoginBtn) {
                    newLoginBtn.addEventListener('click', openLoginModal);
                }
                
                if (newSignupBtn) {
                    newSignupBtn.addEventListener('click', openSignupModal);
                }
            }
            
            // Hide user-specific content
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.guest-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    }
    
    // Add avatar styles
    addAvatarStyles() {
        if (!document.getElementById('avatar-styles')) {
            const style = document.createElement('style');
            style.id = 'avatar-styles';
            style.textContent = `
                .user-profile {
                    position: relative;
                }
                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: #9d4edd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .user-avatar:hover {
                    background-color: #7b2cbf;
                }
                .user-dropdown {
                    position: absolute;
                    top: 45px;
                    right: 0;
                    background-color: white;
                    border-radius: 5px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    width: 200px;
                    z-index: 100;
                    display: none;
                }
                .user-dropdown.active {
                    display: block;
                    animation: fadeIn 0.2s;
                }
                .user-dropdown ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .user-dropdown ul li {
                    padding: 0;
                }
                .user-dropdown ul li a {
                    display: block;
                    padding: 12px 15px;
                    color: #333;
                    text-decoration: none;
                    transition: background-color 0.3s;
                }
                .user-dropdown ul li a:hover {
                    background-color: #f5f5f5;
                    color: #9d4edd;
                }
                .user-dropdown ul li:first-child a {
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                .user-dropdown ul li:last-child a {
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Create user manager instance
const userManager = new UserManager();

// Modal Functions
function openLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'flex';
        setTimeout(() => {
            loginModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('active');
        setTimeout(() => {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function openSignupModal() {
    if (signupModal) {
        signupModal.style.display = 'flex';
        setTimeout(() => {
            signupModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeSignupModal() {
    if (signupModal) {
        signupModal.classList.remove('active');
        setTimeout(() => {
            signupModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Modal event listeners
if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
if (signupBtn) signupBtn.addEventListener('click', openSignupModal);
if (loginCloseBtn) loginCloseBtn.addEventListener('click', closeLoginModal);
if (signupCloseBtn) signupCloseBtn.addEventListener('click', closeSignupModal);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (loginModal && e.target === loginModal) closeLoginModal();
    if (signupModal && e.target === signupModal) closeSignupModal();
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (loginModal && loginModal.classList.contains('active')) closeLoginModal();
        if (signupModal && signupModal.classList.contains('active')) closeSignupModal();
    }
});

// Switch between login and signup modals
if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        setTimeout(() => {
            openSignupModal();
        }, 300);
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeSignupModal();
        setTimeout(() => {
            openLoginModal();
        }, 300);
    });
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Clear previous error
        if (loginError) loginError.textContent = '';
        
        // Simple validation
        if (!email || !password) {
            if (loginError) loginError.textContent = 'Please fill in all fields';
            return;
        }
        
        try {
            // Attempt to login
            userManager.login(email, password);
            
            // Clear form
            loginForm.reset();
            
            // Close modal
            closeLoginModal();
            
            // Show success message
            showNotification('You have successfully logged in!');
        } catch (error) {
            if (loginError) loginError.textContent = error.message;
        }
    });
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword') ? document.getElementById('confirmPassword').value : password;
        const plan = document.getElementById('plan').value;
        
        // Clear previous error
        const signupError = document.getElementById('signupError');
        if (signupError) signupError.textContent = '';
        
        // Simple validation
        if (!name || !email || !password || !plan) {
            if (signupError) signupError.textContent = 'Please fill in all fields';
            return;
        }
        
        if (password !== confirmPassword) {
            if (signupError) signupError.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            // Attempt to register user
            userManager.register(name, email, password, plan);
            
            // Clear form
            signupForm.reset();
            
            // Close modal
            closeSignupModal();
            
            // Show success message
            showNotification('Account created successfully! Welcome to CineVerse.');
        } catch (error) {
            if (signupError) signupError.textContent = error.message;
        }
    });
}

// Notification functions
function showNotification(message, isError = false) {
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.remove('error');
        
        if (isError) {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize notification close button
    if (notificationClose) {
        notificationClose.addEventListener('click', () => {
            notification.classList.remove('show');
        });
    }
    
    // Pre-create demo accounts if none exist
    if (userManager.users.length === 0) {
        try {
            userManager.register('Demo User', 'demo@example.com', 'password123', 'standard');
            userManager.register('John Doe', 'john@example.com', 'password123', 'premium');
            
            // Log out to start fresh
            userManager.logout();
            
            console.log('Demo accounts created successfully!');
        } catch (error) {
            console.error('Error creating demo accounts:', error);
        }
    }
}); 