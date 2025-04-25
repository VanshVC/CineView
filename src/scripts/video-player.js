/**
 * CineVerse Video Player
 * A Netflix-style video player with advanced features
 */

class VideoPlayer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            autoplay: false,
            muted: false,
            controls: true,
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
            defaultQuality: 'auto',
            ...options
        };
        
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.quality = this.options.defaultQuality;
        this.playbackRate = 1;
        
        this.initialize();
    }
    
    initialize() {
        // Create player elements
        this.createPlayerElements();
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize controls
        this.initializeControls();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    createPlayerElements() {
        this.container.innerHTML = `
            <div class="cv-player">
                <video class="cv-video"></video>
                
                <div class="cv-overlay">
                    <div class="cv-spinner">
                        <div class="cv-bounce1"></div>
                        <div class="cv-bounce2"></div>
                        <div class="cv-bounce3"></div>
                    </div>
                    
                    <div class="cv-play-overlay">
                        <button class="cv-big-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cv-controls">
                    <div class="cv-progress">
                        <div class="cv-progress-bar">
                            <div class="cv-progress-loaded"></div>
                            <div class="cv-progress-played"></div>
                        </div>
                        <div class="cv-progress-tooltip"></div>
                    </div>
                    
                    <div class="cv-buttons">
                        <button class="cv-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                        
                        <button class="cv-rewind-btn">
                            <i class="fas fa-undo-alt"></i>
                            <span>10</span>
                        </button>
                        
                        <button class="cv-forward-btn">
                            <i class="fas fa-redo-alt"></i>
                            <span>10</span>
                        </button>
                        
                        <div class="cv-volume">
                            <button class="cv-volume-btn">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <div class="cv-volume-slider">
                                <div class="cv-volume-progress"></div>
                            </div>
                        </div>
                        
                        <div class="cv-time">
                            <span class="cv-current">0:00</span>
                            <span class="cv-separator">/</span>
                            <span class="cv-duration">0:00</span>
                        </div>
                        
                        <div class="cv-right-controls">
                            <button class="cv-quality-btn">
                                <span>1080p</span>
                            </button>
                            
                            <button class="cv-speed-btn">
                                <span>1x</span>
                            </button>
                            
                            <button class="cv-fullscreen-btn">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.player = this.container.querySelector('.cv-player');
        this.video = this.container.querySelector('.cv-video');
        this.overlay = this.container.querySelector('.cv-overlay');
        this.controls = this.container.querySelector('.cv-controls');
        this.progress = this.container.querySelector('.cv-progress');
        this.progressBar = this.container.querySelector('.cv-progress-bar');
        this.progressPlayed = this.container.querySelector('.cv-progress-played');
        this.progressLoaded = this.container.querySelector('.cv-progress-loaded');
        this.progressTooltip = this.container.querySelector('.cv-progress-tooltip');
        this.playBtn = this.container.querySelector('.cv-play-btn');
        this.bigPlayBtn = this.container.querySelector('.cv-big-play-btn');
        this.volumeBtn = this.container.querySelector('.cv-volume-btn');
        this.volumeSlider = this.container.querySelector('.cv-volume-slider');
        this.volumeProgress = this.container.querySelector('.cv-volume-progress');
        this.currentTimeDisplay = this.container.querySelector('.cv-current');
        this.durationDisplay = this.container.querySelector('.cv-duration');
        this.qualityBtn = this.container.querySelector('.cv-quality-btn');
        this.speedBtn = this.container.querySelector('.cv-speed-btn');
        this.fullscreenBtn = this.container.querySelector('.cv-fullscreen-btn');
    }
    
    addEventListeners() {
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.video.addEventListener('progress', () => this.onProgress());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('playing', () => this.hideLoading());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('ended', () => this.onEnded());
        
        // Control events
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.bigPlayBtn.addEventListener('click', () => this.togglePlay());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Progress bar events
        this.progress.addEventListener('mousedown', (e) => this.onProgressMouseDown(e));
        this.progress.addEventListener('mousemove', (e) => this.onProgressMouseMove(e));
        this.progress.addEventListener('mouseleave', () => this.hideProgressTooltip());
        
        // Volume slider events
        this.volumeSlider.addEventListener('mousedown', (e) => this.onVolumeMouseDown(e));
        this.volumeSlider.addEventListener('mousemove', (e) => this.onVolumeMouseMove(e));
        this.volumeSlider.addEventListener('mouseleave', () => this.onVolumeMouseLeave());
        
        // Quality and speed button events
        this.qualityBtn.addEventListener('click', () => this.toggleQualityMenu());
        this.speedBtn.addEventListener('click', () => this.toggleSpeedMenu());
    }
    
    initializeControls() {
        // Set initial volume
        this.setVolume(this.volume);
        
        // Hide controls initially
        this.hideControls();
        
        // Show controls on mouse move
        let controlsTimeout;
        this.player.addEventListener('mousemove', () => {
            this.showControls();
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => this.hideControls(), 3000);
        });
        
        // Hide controls when mouse leaves player
        this.player.addEventListener('mouseleave', () => {
            if (!this.video.paused) {
                this.hideControls();
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.container.contains(document.activeElement)) {
                switch(e.key.toLowerCase()) {
                    case ' ':
                    case 'k':
                        e.preventDefault();
                        this.togglePlay();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleMute();
                        break;
                    case 'arrowleft':
                        e.preventDefault();
                        this.seek(this.currentTime - 10);
                        break;
                    case 'arrowright':
                        e.preventDefault();
                        this.seek(this.currentTime + 10);
                        break;
                    case 'arrowup':
                        e.preventDefault();
                        this.setVolume(Math.min(this.volume + 0.1, 1));
                        break;
                    case 'arrowdown':
                        e.preventDefault();
                        this.setVolume(Math.max(this.volume - 0.1, 0));
                        break;
                }
            }
        });
    }
    
    // Playback controls
    togglePlay() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    play() {
        this.video.play();
    }
    
    pause() {
        this.video.pause();
    }
    
    seek(time) {
        this.video.currentTime = Math.max(0, Math.min(time, this.duration));
    }
    
    // Volume controls
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(volume, 1));
        this.video.volume = this.volume;
        this.volumeProgress.style.width = `${this.volume * 100}%`;
        
        // Update volume icon
        const volumeIcon = this.volumeBtn.querySelector('i');
        volumeIcon.className = 'fas';
        if (this.volume === 0) {
            volumeIcon.classList.add('fa-volume-mute');
        } else if (this.volume < 0.5) {
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.add('fa-volume-up');
        }
    }
    
    toggleMute() {
        if (this.video.muted) {
            this.video.muted = false;
            this.setVolume(this.volume || 1);
        } else {
            this.video.muted = true;
            this.setVolume(0);
        }
    }
    
    // Event handlers
    onLoadedMetadata() {
        this.duration = this.video.duration;
        this.durationDisplay.textContent = this.formatTime(this.duration);
    }
    
    onTimeUpdate() {
        this.currentTime = this.video.currentTime;
        this.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        this.progressPlayed.style.width = `${(this.currentTime / this.duration) * 100}%`;
    }
    
    onProgress() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            this.progressLoaded.style.width = `${(bufferedEnd / this.duration) * 100}%`;
        }
    }
    
    onPlay() {
        this.playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
        this.bigPlayBtn.style.display = 'none';
    }
    
    onPause() {
        this.playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        this.bigPlayBtn.style.display = 'flex';
    }
    
    onEnded() {
        this.pause();
        this.seek(0);
    }
    
    // UI helpers
    showLoading() {
        this.overlay.querySelector('.cv-spinner').style.display = 'flex';
    }
    
    hideLoading() {
        this.overlay.querySelector('.cv-spinner').style.display = 'none';
    }
    
    showControls() {
        this.controls.style.opacity = '1';
    }
    
    hideControls() {
        if (!this.video.paused) {
            this.controls.style.opacity = '0';
        }
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Public methods
    loadVideo(src, type = 'video/mp4') {
        this.video.innerHTML = `<source src="${src}" type="${type}">`;
        this.video.load();
    }
    
    destroy() {
        // Remove all event listeners and clean up
        this.container.innerHTML = '';
    }
}

// Export the VideoPlayer class
window.VideoPlayer = VideoPlayer; 