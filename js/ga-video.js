/**
 * GA4 YouTube Video Tracking
 * Custom tracking for embedded YouTube videos with hidden controls
 */

(function() {
    'use strict';
    
    // Configuration
    const PROGRESS_SECONDS = [5, 10, 15, 30, 45, 60, 75, 90]; // Track specific seconds
    const VIDEO_ID = 'nyu_youtube_ad';
    
    // Tracking state
    let videoState = {
        isStarted: false,
        duration: 0,
        maxWatched: 0, // Anti-skip logic: track max watched time
        progressTracked: new Set(), // Track which progress points have been sent
        startTime: null,
        totalWatchedMs: 0,
        player: null,
        isMuted: false,
        currentTime: 0
    };
    
    // YouTube API ready flag
    let youTubeAPIReady = false;
    
    /**
     * Load YouTube iframe API
     */
    function loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            youTubeAPIReady = true;
            initVideoTracking();
            return;
        }
        
        // Load YouTube iframe API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // YouTube API calls this when ready
        window.onYouTubeIframeAPIReady = function() {
            youTubeAPIReady = true;
            initVideoTracking();
        };
    }
    
    /**
     * Initialize video tracking
     */
    function initVideoTracking() {
        // Wait for GALite to be available
        if (!window.GALite) {
            setTimeout(initVideoTracking, 100);
            return;
        }
        
        if (!youTubeAPIReady) {
            loadYouTubeAPI();
            return;
        }
        
        // Find YouTube iframe
        const iframe = document.getElementById('adVideo');
        if (iframe && iframe.tagName === 'IFRAME') {
            setupYouTubeTracking(iframe);
        }
    }
    
    /**
     * Set up YouTube tracking
     */
    function setupYouTubeTracking(iframe) {
        console.log('Setting up YouTube tracking...');
        
        // Create YouTube player instance
        videoState.player = new YT.Player(iframe, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    
    /**
     * YouTube player ready callback
     */
    function onPlayerReady(event) {
        console.log('YouTube player ready');
        videoState.duration = videoState.player.getDuration();
        
        // Set up time tracking interval
        setInterval(() => {
            if (videoState.player && videoState.player.getPlayerState() === YT.PlayerState.PLAYING) {
                const currentTime = videoState.player.getCurrentTime();
                updateVideoProgress(currentTime);
            }
            
            // Anti-pause: If video is paused, resume it immediately
            if (videoState.player && videoState.player.getPlayerState() === YT.PlayerState.PAUSED) {
                console.log('Video paused - resuming automatically');
                videoState.player.playVideo();
            }
        }, 250); // Check every 250ms for smooth tracking
        
        // Wait for tap-to-start before beginning video playback
        waitForTapToStart();
    }
    
    /**
     * YouTube player state change callback
     */
    function onPlayerStateChange(event) {
        const currentTime = videoState.player.getCurrentTime();
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                handleVideoPlay(currentTime);
                break;
            case YT.PlayerState.PAUSED:
                handleVideoPause(currentTime);
                break;
            case YT.PlayerState.ENDED:
                handleVideoEnd(currentTime);
                break;
        }
    }
    
    /**
     * Wait for tap-to-start before beginning video playback
     */
    function waitForTapToStart() {
        const tapOverlay = document.getElementById('tap-to-start-overlay');
        if (!tapOverlay) {
            // No tap-to-start overlay, start video immediately
            startVideo();
            return;
        }
        
        // Check if overlay is already hidden
        if (tapOverlay.classList.contains('hidden') || 
            window.getComputedStyle(tapOverlay).display === 'none') {
            startVideo();
            return;
        }
        
        // Wait for tap-to-start click
        tapOverlay.addEventListener('click', () => {
            console.log('Tap to start - starting video playback');
            startVideo();
        }, { once: true });
    }
    
    /**
     * Start video playback with proper autoplay handling
     */
    function startVideo() {
        if (!videoState.player) {
            console.log('Player not ready yet');
            return;
        }
        
        console.log('Starting video playback...');
        
        try {
            // Start muted first (browsers allow muted autoplay)
            videoState.player.mute();
            videoState.isMuted = true;
            
            // Play the video
            videoState.player.playVideo();
            
            // After a short delay, unmute it
            setTimeout(() => {
                videoState.player.unMute();
                videoState.isMuted = false;
                updateMuteIcon();
                console.log('Video unmuted after autoplay');
            }, 500);
            
        } catch (error) {
            console.log('Autoplay failed:', error);
            // Fallback: keep muted and let user unmute manually
            videoState.player.mute();
            videoState.isMuted = true;
            videoState.player.playVideo();
            updateMuteIcon();
        }
    }
    
    /**
     * Handle video play event
     */
    function handleVideoPlay(currentTime) {
        console.log('Video play at:', currentTime);
        
        if (!videoState.isStarted) {
            videoState.isStarted = true;
            videoState.startTime = Date.now();
            
            trackVideoEvent('video_start', {
                video_duration: videoState.duration,
                current_time: currentTime
            });
        }
        
        trackVideoEvent('video_play', {
            current_time: currentTime,
            is_muted: videoState.isMuted
        });
    }
    
    /**
     * Handle video pause event
     */
    function handleVideoPause(currentTime) {
        console.log('Video pause at:', currentTime);
        
        trackVideoEvent('video_pause', {
            current_time: currentTime,
            watch_time_s: Math.floor(currentTime)
        });
    }
    
    /**
     * Handle video end event
     */
    function handleVideoEnd(currentTime) {
        console.log('Video ended at:', currentTime);
        
        const totalWatchedS = Math.floor(videoState.totalWatchedMs / 1000);
        
        trackVideoEvent('video_complete', {
            duration_s: videoState.duration,
            watched_s: totalWatchedS,
            completion_rate: Math.min(100, (currentTime / videoState.duration) * 100),
            max_watched_s: Math.floor(videoState.maxWatched)
        });
    }
    
    /**
     * Update video progress and track milestones
     */
    function updateVideoProgress(currentTime) {
        videoState.currentTime = currentTime;
        
        // Anti-skip logic: only count forward progress
        if (currentTime > videoState.maxWatched) {
            const progressMs = (currentTime - videoState.maxWatched) * 1000;
            videoState.totalWatchedMs += progressMs;
            videoState.maxWatched = currentTime;
        }
        
        // Track specific second milestones
        PROGRESS_SECONDS.forEach(second => {
            if (currentTime >= second && !videoState.progressTracked.has(second)) {
                videoState.progressTracked.add(second);
                
                trackVideoEvent('video_progress', {
                    progress_second: second,
                    current_time: currentTime,
                    watched_ms: videoState.totalWatchedMs,
                    percent_watched: Math.min(100, (currentTime / videoState.duration) * 100)
                });
            }
        });
        
        // Track percentage milestones
        const percentages = [25, 50, 75, 100];
        percentages.forEach(percent => {
            const targetTime = (percent / 100) * videoState.duration;
            const key = `${percent}%`;
            
            if (currentTime >= targetTime && !videoState.progressTracked.has(key)) {
                videoState.progressTracked.add(key);
                
                trackVideoEvent('video_progress', {
                    progress_percent: percent,
                    current_time: currentTime,
                    watched_ms: videoState.totalWatchedMs
                });
            }
        });
    }
    
    /**
     * Track video event
     */
    function trackVideoEvent(eventName, parameters = {}) {
        const eventData = {
            video_id: VIDEO_ID,
            video_platform: 'youtube',
            study_id: 'instagram_study',
            ...parameters
        };
        
        console.log(`Tracking ${eventName}:`, eventData);
        window.GALite.track(eventName, eventData);
    }
    
    /**
     * Toggle mute functionality
     */
    function toggleMute() {
        if (!videoState.player) return;
        
        if (videoState.player.isMuted()) {
            videoState.player.unMute();
            videoState.isMuted = false;
        } else {
            videoState.player.mute();
            videoState.isMuted = true;
        }
        
        trackVideoEvent('video_mute_toggle', {
            is_muted: videoState.isMuted,
            current_time: videoState.currentTime
        });
        
        // Update mute icon
        updateMuteIcon();
    }
    
    /**
     * Update mute icon display
     */
    function updateMuteIcon() {
        const muteIcon = document.querySelector('.mute-toggle-icon');
        if (!muteIcon) return;
        
        if (videoState.isMuted) {
            muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M1 1l22 22"/>';
        } else {
            muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        }
    }
    
    /**
     * Handle page unload - capture final video progress
     */
    function handlePageUnload() {
        if (!videoState.player || !videoState.isStarted) {
            return; // No video data to capture
        }
        
        const currentTime = videoState.currentTime;
        const totalWatchedS = Math.floor(videoState.totalWatchedMs / 1000);
        const completionRate = videoState.duration > 0 ? (currentTime / videoState.duration) * 100 : 0;
        
        console.log('Page unload - capturing final video progress');
        
        // Send final progress event
        trackVideoEvent('video_session_end', {
            final_position: currentTime,
            total_watched_s: totalWatchedS,
            completion_rate: Math.min(100, completionRate),
            session_duration_s: videoState.startTime ? Math.floor((Date.now() - videoState.startTime) / 1000) : 0,
            max_watched_s: Math.floor(videoState.maxWatched),
            video_duration: videoState.duration
        });
        
        // Also send a final progress milestone if they watched significant content
        if (currentTime >= 5 && !videoState.progressTracked.has('session_end')) {
            videoState.progressTracked.add('session_end');
            
            trackVideoEvent('video_progress', {
                progress_type: 'session_end',
                current_time: currentTime,
                watched_ms: videoState.totalWatchedMs,
                percent_watched: Math.min(100, completionRate)
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadYouTubeAPI);
    } else {
        loadYouTubeAPI();
    }
    
    // Capture video progress on page unload
    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('pagehide', handlePageUnload);
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            handlePageUnload();
        }
    });
    
    // Expose mute toggle for click handlers
    window.VideoTracker = {
        toggleMute: toggleMute,
        getState: () => ({ ...videoState })
    };
    
})();