/**
 * Timeline Slider for Coming Soon Section
 * Handles the horizontal scrolling of the timeline items
 */

document.addEventListener('DOMContentLoaded', function() {
    initTimelineSlider();
});

function initTimelineSlider() {
    const timeline = document.querySelector('.timeline');
    const prevBtn = document.querySelector('.timeline-prev');
    const nextBtn = document.querySelector('.timeline-next');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timeline || !prevBtn || !nextBtn || timelineItems.length === 0) return;
    
    // Set initial position
    let currentIndex = 0;
    const itemWidth = timelineItems[0].offsetWidth;
    const visibleItems = Math.floor(timeline.offsetWidth / itemWidth);
    const maxIndex = timelineItems.length - visibleItems;
    
    // Update timeline position
    function updatePosition() {
        const position = -currentIndex * itemWidth;
        timeline.style.transform = `translateX(${position}px)`;
        
        // Update button states
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        
        // Visual feedback for disabled buttons
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }
    
    // Initialize position
    updatePosition();
    
    // Previous button click
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updatePosition();
        }
    });
    
    // Next button click
    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updatePosition();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Recalculate visible items
        const newVisibleItems = Math.floor(timeline.offsetWidth / itemWidth);
        const newMaxIndex = timelineItems.length - newVisibleItems;
        
        // Adjust current index if needed
        if (currentIndex > newMaxIndex) {
            currentIndex = Math.max(0, newMaxIndex);
        }
        
        // Update position
        updatePosition();
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle keys when timeline is in viewport
        const rect = timeline.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updatePosition();
            } else if (e.key === 'ArrowRight' && currentIndex < maxIndex) {
                currentIndex++;
                updatePosition();
            }
        }
    });
    
    // Add touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    timeline.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    timeline.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold && currentIndex < maxIndex) {
            // Swipe left
            currentIndex++;
            updatePosition();
        } else if (touchEndX > touchStartX + swipeThreshold && currentIndex > 0) {
            // Swipe right
            currentIndex--;
            updatePosition();
        }
    }
}