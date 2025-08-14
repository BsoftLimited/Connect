document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('custom-video') as HTMLVideoElement | null;
    const playPauseBtn = document.querySelector('.play-pause');
    const seekBar = document.querySelector('.seek-bar') as HTMLInputElement | null;
    const muteBtn = document.querySelector('.mute');
    const volumeBar = document.querySelector('.volume-bar') as HTMLInputElement | null;
    const fullscreenBtn = document.querySelector('.fullscreen');
    const timeDisplay = document.querySelector('.time-display');
    
    if (!video || !playPauseBtn || !seekBar || !muteBtn || !volumeBar || !fullscreenBtn || !timeDisplay) {
        console.error('One or more video control elements are missing.');
        return;
    }

    // Play/Pause toggle
    playPauseBtn?.addEventListener('click', () => {
        if (video!.paused) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
    });
    
    // Seek bar
    video.addEventListener('timeupdate', () => {
        seekBar.value = ((video.currentTime / video.duration) * 100).toString();
        updateTimeDisplay();
    });
    
    seekBar.addEventListener('input', () => {
        const seekTime = (Number.parseFloat(seekBar.value) / 100) * video.duration;
        video.currentTime = seekTime;
    });
    
    // Volume controls
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
        volumeBar.value = (video.muted ? 0 : video.volume).toString();
    });
    
    volumeBar.addEventListener('input', () => {
        video.volume = Number.parseFloat(volumeBar.value);
        video.muted = Number.parseFloat(volumeBar.value) == 0;
        muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    // Time display formatting
    function updateTimeDisplay() {
        const currentTime = formatTime(video!.currentTime);
        const duration = formatTime(video!.duration);
        timeDisplay!.textContent = `${currentTime} / ${duration}`;
    }
    
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Hide default controls
    video.controls = false;
});