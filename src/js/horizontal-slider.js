/**
 * Horizontal Slider for Movies Page
 * A modern, responsive slider with smooth transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    initHorizontalSlider();
    initMovieDetailsModal();
});

/**
 * Initialize the Horizontal Slider
 */
function initHorizontalSlider() {
    const slider = document.querySelector('.horizontal-slider');
    if (!slider) return;
    
    const sliderCards = slider.querySelectorAll('.slider-card');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const paginationDots = document.querySelectorAll('.slider-dot');
    
    // Set animation delay for entrance effect
    sliderCards.forEach((card, index) => {
        card.style.setProperty('--index', index);
    });
    
    // Calculate the scroll amount (card width + gap)
    const cardWidth = sliderCards[0].offsetWidth;
    const gap = 20; // This should match the gap in CSS
    const scrollAmount = cardWidth + gap;
    const cardsPerView = Math.floor(slider.offsetWidth / scrollAmount);
    const totalScrollableCards = sliderCards.length - cardsPerView;
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -scrollAmount * 2,
                behavior: 'smooth'
            });
            updatePagination();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: scrollAmount * 2,
                behavior: 'smooth'
            });
            updatePagination();
        });
    }
    
    // Pagination dots
    if (paginationDots.length > 0) {
        paginationDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Calculate how many cards to scroll based on the dot index
                const scrollPosition = (index * scrollAmount * 2);
                
                slider.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
                
                // Update active dot
                paginationDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }
    
    // Update pagination on scroll
    slider.addEventListener('scroll', () => {
        updatePagination();
    });
    
    // Function to update pagination based on scroll position
    function updatePagination() {
        if (paginationDots.length === 0) return;
        
        const scrollPosition = slider.scrollLeft;
        const maxScroll = slider.scrollWidth - slider.offsetWidth;
        const scrollPercentage = scrollPosition / maxScroll;
        
        // Calculate which dot should be active
        const activeDotIndex = Math.min(
            Math.floor(scrollPercentage * paginationDots.length),
            paginationDots.length - 1
        );
        
        // Update active dot
        paginationDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Recalculate values on resize
        const newCardWidth = sliderCards[0].offsetWidth;
        const newCardsPerView = Math.floor(slider.offsetWidth / (newCardWidth + gap));
        
        // Update pagination if needed
        updatePagination();
    });
}

/**
 * Initialize Movie Details Modal
 */
function initMovieDetailsModal() {
    const infoButtons = document.querySelectorAll('.slider-buttons .info-btn');
    const modal = document.getElementById('movieDetailsModal');
    
    if (!modal || !infoButtons.length) return;
    
    const modalTitle = document.getElementById('modalMovieTitle');
    const modalDirector = document.getElementById('modalDirector');
    const modalOverview = document.getElementById('modalOverview');
    const closeBtn = modal.querySelector('.close-modal');
    
    infoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get movie data from data attributes
            const movieTitle = this.closest('.slider-card-inner').querySelector('h3').textContent;
            const director = this.getAttribute('data-director');
            const overview = this.getAttribute('data-overview');
            
            // Populate modal with movie data
            modalTitle.textContent = movieTitle;
            modalDirector.innerHTML = '<strong>Director:</strong> ' + director;
            modalOverview.textContent = overview;
            
            // Display modal with animation
            modal.style.display = 'flex';
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeMovieModal();
        });
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeMovieModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeMovieModal();
        }
    });
    
    // Function to close the modal
    function closeMovieModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}