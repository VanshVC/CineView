/**
 * CineVerse Theme Module
 * Handles theme-related functionality
 */

// Make header sticky on scroll
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Animation for page elements
document.addEventListener('DOMContentLoaded', () => {
    // Animate page banner
    const banner = document.querySelector('.page-banner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            banner.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Animate filter buttons
    const filterSection = document.querySelector('.genre-filters');
    if (filterSection) {
        filterSection.style.opacity = '0';
        filterSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            filterSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            filterSection.style.opacity = '1';
            filterSection.style.transform = 'translateY(0)';
        }, 400);
    }
    
    // Animate movie cards with staggered delay
    const movieCards = document.querySelectorAll('.movie-card, .show-card, .content-card');
    movieCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 600 + (index * 100)); // Staggered delay
    });
}); 