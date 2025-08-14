import { createSignal, type Component, type JSX } from "solid-js";
import { useAppContext } from "../providers/app";
import type { DirectoryFile } from "../utils/files_repository";
import { isVideoOrAudio } from "../utils/util";

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

interface FileInfoViewProps{
    file: DirectoryFile
}

const FileInfoView: Component<FileInfoViewProps> = ({ file }) =>{
    return (
        <div class="file-info">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 256 256"><path fill="currentColor" d="M160 44a84.11 84.11 0 0 0-76.41 49.12A60.7 60.7 0 0 0 72 92a60 60 0 0 0 0 120h88a84 84 0 0 0 0-168m0 160H72a52 52 0 1 1 8.55-103.3A83.7 83.7 0 0 0 76 128a4 4 0 0 0 8 0a76 76 0 1 1 76 76m34.83-94.83a4 4 0 0 1 0 5.66l-48 48a4 4 0 0 1-5.66 0l-24-24a4 4 0 0 1 5.66-5.66L144 154.34l45.17-45.17a4 4 0 0 1 5.66 0"/></svg>
            </span>
            <div>
                <p style={{ "font-size": "16px" }}>{file.name}</p>
                <p style={{ "font-size": "12px", "font-weight": 300 }}>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
        </div>
    );
}

const Streaming = () =>{
    const { state } = useAppContext();
    const [playing, setPlaying] = createSignal<boolean>(false);
    const [timeDisplay, setTimeDisplay] = createSignal<string>("00:00 / 00:00");
    const [seekValue, setSeekValue] = createSignal(0);
    const [mute, setMute] = createSignal(false);
    const [volume, setVolume] = createSignal(1);

    let videoElement: HTMLVideoElement | undefined = undefined;
    const videoElementReady = (element: HTMLVideoElement) =>{
        videoElement = element;
    }

    // Time display formatting
    const updateTimeDisplay = () =>{
        const currentTime = formatTime(videoElement!.currentTime);
        const duration = formatTime(videoElement!.duration);
        setTimeDisplay(`${currentTime} / ${duration}`);
    }

    const timeChange: JSX.EventHandler<HTMLVideoElement, Event> = (event) =>{
        setSeekValue((event.currentTarget.currentTime / event.currentTarget.duration) * 100);
        updateTimeDisplay();
    }

    const togglePlay = () =>{
        if (videoElement!.paused) {
            videoElement!.play();
            setPlaying(true);
        } else {
            videoElement!.pause();
            setPlaying(false);
        }
    }

    const seekChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        const seekTime = (Number.parseFloat(event.currentTarget.value) / 100) * videoElement!.duration;
        videoElement!.currentTime = seekTime;
        setSeekValue(seekTime);
    }

    const toggleMute = () =>{
        const isMuted = mute();
        setMute(!isMuted);
        setVolume(!isMuted ? 0 : videoElement!.volume);
    }

    const volumeChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        const currentValue = Number.parseFloat(event.currentTarget.value);

        videoElement!.volume = currentValue;
        setMute(currentValue === 0);
        setVolume(currentValue);
    }

    const toggleFullScreen = () =>{
        if (!document.fullscreenElement) {
            videoElement!.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    return (
        <div style={{ display: "flex", flex: 1, "flex-direction": "row", width: "100%", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" }}>
                <div style={{ "max-width": "800px", padding: "1rem", display: "flex", "flex-direction": "column", gap: "1rem" }}>
                    <h3>Playing : {state().file}</h3>
                    <p>Click on the video to play or pause.</p>
                    <div class="video-container">
                        <video ref={videoElementReady} onTimeUpdate={timeChange} muted={mute()} src={`/files/${state().directory!.path}/${state().file}`}></video>
                        <div class="custom-controls">
                            <button class="play-pause" onClick={togglePlay}>{ playing() ? "pause" : "play" }</button>
                            <input type="range" class="seek-bar" value={seekValue()} onChange={seekChange} />
                            <button class="mute" onClick={toggleMute}>{ mute() ? "unmute" : "mute" }</button>
                            <input type="range" class="volume-bar" min="0" max="1" step="0.1" onChange={volumeChange} value={volume()} />
                            <button class="fullscreen" onClick={toggleFullScreen}>Fullscreen</button>
                            <span class="time-display">{timeDisplay()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ overflow: "auto", width: "24rem" }}>
                { state().directory!.files.filter((file)=> isVideoOrAudio(file.name)).map((file)=>(<FileInfoView file={file}/>)) }
            </div>
        </div>
    );
}

export default Streaming;