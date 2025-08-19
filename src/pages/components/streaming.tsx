import { createSignal, Match, onCleanup, onMount, Show, Switch, type Component, type JSX } from "solid-js";
import { useAppContext } from "../providers/app";
import type { DirectoryFile } from "../../utils/files_repository";
import { isAudio, isVideo, isVideoOrAudio } from "../../utils/util";
import PlayButton from "./play-button";
import MuteButton from "./mute-button";
import { Motion } from "@motionone/solid";

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

interface FileInfoViewProps{
    file: DirectoryFile
}

const FileInfoView: Component<FileInfoViewProps> = ({ file }) =>{
    const { stream } = useAppContext();

    const clicked = () => stream(file.name);

    return (
        <div class="file-info" style={{ cursor: "pointer" }} onClick={clicked}>
            <span>
                <Switch>
                    <Match when={isVideo(file.name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 32 32"><path fill="currentColor" d="M12 12.001V20a1 1 0 0 0 1.47.882l7.498-3.999a1 1 0 0 0 0-1.764l-7.497-3.999a1 1 0 0 0-1.471.882M6.5 28h19a4.5 4.5 0 0 0 4.5-4.5v-15A4.5 4.5 0 0 0 25.5 4h-19A4.5 4.5 0 0 0 2 8.5v15A4.5 4.5 0 0 0 6.5 28m19-1h-19A3.5 3.5 0 0 1 3 23.5v-15A3.5 3.5 0 0 1 6.5 5h19A3.5 3.5 0 0 1 29 8.5v15a3.5 3.5 0 0 1-3.5 3.5"/></svg>
                    </Match>
                    <Match when={isAudio(file.name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 24 24"><path fill="currentColor" d="M19.698 2.148A.75.75 0 0 1 20 2.75v13.5l-.004.079q.004.086.004.171a3.5 3.5 0 1 1-1.5-2.873V7.758l-8.5 2.55v7.942l-.004.079q.004.085.004.171a3.5 3.5 0 1 1-1.5-2.873V5.75a.75.75 0 0 1 .534-.718l10-3a.75.75 0 0 1 .664.116M10 8.742l8.5-2.55V3.758L10 6.308zM6.5 16.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4m8 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/></svg>
                    </Match>
                </Switch>
            </span>
            <div>
                <p style={{ "font-size": "12px", "max-lines": "2" }}>{file.name}</p>
                <p style={{ "font-size": "12px", "font-weight": 300 }}>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
        </div>
    );
}

interface StreamingState{
    playing: boolean,
    seekValue: number,
    duration: number
    mute: boolean,
    volume: number
}

const Streaming = () =>{
    const { appState, closeStream } = useAppContext();

    const [showControls, setShowControls] = createSignal(true);
    const [showList, setShowList] = createSignal(false);

    let videoElement: HTMLVideoElement | undefined = undefined;
    let timeoutId: any;

    const [ streamingState, setStreamingState ] = createSignal<StreamingState>({
        playing: false, seekValue: 0, mute: false, volume: 1, duration: 0
    });

    // Reset the hide controls timeout
    const resetControlsTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            setShowControls(false);
        }, 5000);
    };

    // Handle mouse movement to show controls
    const handleUserActivity = () => {
        setShowControls(true);
        resetControlsTimeout();
    };

    // Set up event listeners
    onMount(() => {
        if(isVideo(appState().file!)){
            window.addEventListener("mousemove", handleUserActivity);
            window.addEventListener("keydown", handleUserActivity);
            window.addEventListener("scroll", handleUserActivity);
            resetControlsTimeout();
        }
    });
    
    // Clean up
    onCleanup(() => {
        if(isVideo(appState().file!)){
            clearTimeout(timeoutId);
            window.removeEventListener("mousemove", handleUserActivity);
            window.removeEventListener("keydown", handleUserActivity);
        }
    });

    const onVideoChange: JSX.EventHandler<HTMLVideoElement, Event> = (event) =>{
        setStreamingState(init=> { 
            return {...init, 
                playing: !event.currentTarget.paused,
                mute: event.currentTarget.muted,
                volume: event.currentTarget.volume,
                duration: Number.isNaN(event.currentTarget.duration) ? 0 : event.currentTarget.duration, 
                seekValue: event.currentTarget.currentTime } });
    }

    const download = () =>{
        window.location.href = `/download/${appState().directory!.path.replaceAll("\\", "/")}/${appState().file!}`;
    }

    const togglePlay = () =>{
        if (videoElement!.paused) {
            videoElement!.play();
        } else {
            videoElement!.pause();
        }
    }

    const seekChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        videoElement!.currentTime = (Number.parseFloat(event.currentTarget.value) * streamingState().duration) / 100;
    }

    const toggleMute = () =>{
        videoElement!.muted = !videoElement!.muted;
    }

    const volumeChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        const currentValue = Number.parseFloat(event.currentTarget.value);

        videoElement!.volume = currentValue;
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
        <div style={{  flex: 1, width: "100%", overflow: "hidden", background: "black" }}>
            <video class="video" autoplay poster="/assets/images/music-poster.png" controls={false} ref={videoElement} onPlaying={onVideoChange} onVolumeChange={onVideoChange} onPause={onVideoChange} onTimeUpdate={onVideoChange} muted={streamingState().mute} src={`/files/${appState().directory!.path}/${appState().file}`}></video>
            <Show when={showControls()}>
                <div class="controls">
                    <div style={{ padding: "1rem", display: "flex", "flex-direction": "row", width: "100%", gap: "2rem" }}>
                        <div style={{ flex: 1, display: "flex", "flex-direction": "row", "align-items": "center", gap: "0.8rem" }}>
                            <span onClick={closeStream} style={{ color: "white", cursor: "pointer" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.6rem" height="1.6rem" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01m181.008-630.016c-12.496-12.496-32.752-12.496-45.248 0L512 466.752l-135.76-135.76c-12.496-12.496-32.752-12.496-45.264 0c-12.496 12.496-12.496 32.752 0 45.248L466.736 512l-135.76 135.76c-12.496 12.48-12.496 32.769 0 45.249c12.496 12.496 32.752 12.496 45.264 0L512 557.249l135.76 135.76c12.496 12.496 32.752 12.496 45.248 0c12.496-12.48 12.496-32.769 0-45.249L557.248 512l135.76-135.76c12.512-12.512 12.512-32.768 0-45.248"/></svg>
                            </span>
                            <h3 style={{ color: "whitesmoke", "font-weight": "lighter" }}>Playing : {appState().file}</h3>
                        </div>
                        <div style={{ display: "flex", "flex-direction": "row", "align-items": "center", gap: "2rem" }}>
                            <span onClick={download} style={{ color: "white", cursor: "pointer" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="2.4rem" height="2.4rem" viewBox="0 0 42 32"><path fill="currentColor" d="M33.958 12.982C33.528 6.372 28.931 0 20.5 0c-1.029 0-2.044.1-3.018.297a.5.5 0 0 0 .199.981A14 14 0 0 1 20.5 1C29.088 1 33 7.739 33 14v1.5a.5.5 0 0 0 1 0V14l-.001-.016C37.062 14.248 41 16.916 41 22.5c0 4.767-3.514 8.5-8 8.5H9c-3.976 0-8-2.92-8-8.5C1 18.406 3.504 14 9 14h1.5a.5.5 0 0 0 0-1H9v-2c0-3.727 2.299-6.042 6-6.042c3.364 0 6 2.654 6 6.042v12.993l-4.16-3.86a.499.499 0 1 0-.68.732l4.516 4.189c.299.298.563.445.827.445c.261 0 .52-.145.808-.433l4.529-4.202a.5.5 0 0 0 .026-.706a.497.497 0 0 0-.706-.026L22 23.993V11c0-3.949-3.075-7.042-7-7.042c-4.252 0-7 2.764-7 7.042v2.051c-5.255.508-8 5.003-8 9.449C0 27.105 3.154 32 9 32h24c5.047 0 9-4.173 9-9.5c0-6.304-4.557-9.278-8.042-9.518"/></svg>
                            </span>
                            <span onClick={()=> setShowList(true)} style={{ color: "white", cursor: "pointer" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="2.4rem" height="2.4rem" viewBox="0 0 20 20"><path fill="currentColor" d="M2.75 5a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5zM2 10.75a.75.75 0 0 1 .75-.75h9.587a5.5 5.5 0 0 0-1.447 1.5H2.75a.75.75 0 0 1-.75-.75M2.75 15h7.272a5.5 5.5 0 0 0 .353 1.5H2.75a.75.75 0 0 1 0-1.5M20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-2.287-.437l-2.97-1.65a.5.5 0 0 0-.743.437v3.3a.5.5 0 0 0 .743.437l2.97-1.65a.5.5 0 0 0 0-.874"/></svg>
                            </span>
                        </div>
                    </div>
                    <PlayButton toggle={togglePlay} playing={streamingState().playing} />
                    <div class="custom-controls">
                        <span class="time-display">{ `${formatTime(streamingState().seekValue)}` }</span>
                        <input type="range" class="slider seek-bar" style={`--progress: ${(streamingState().seekValue/streamingState().duration) * 100}%`} max={100} step={0.04} value={(streamingState().seekValue/streamingState().duration) * 100} onChange={seekChange} />
                        <span class="time-display">{ `${formatTime(streamingState().duration ?? 0)}` }</span>

                        <MuteButton muted={ streamingState().mute} toggle={toggleMute}/>
                        <input type="range" class="slider volume-bar" style={`--progress: ${streamingState().volume * 100}%`} min="0" max="1" step="0.1" onChange={volumeChange} value={ streamingState().volume } />
                        <span onClick={toggleFullScreen}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.8rem" height="1.8rem" viewBox="0 0 28 28"><path fill="currentColor" d="M23.5 6.75a2.25 2.25 0 0 0-2.25-2.25h-5a.75.75 0 0 1 0-1.5h5A3.75 3.75 0 0 1 25 6.75v14.5A3.75 3.75 0 0 1 21.25 25H6.75A3.75 3.75 0 0 1 3 21.25v-5a.75.75 0 0 1 1.5 0v5a2.25 2.25 0 0 0 2.25 2.25H14v-6.75A2.75 2.75 0 0 1 16.75 14h6.75zm0 8.75h-6.75c-.69 0-1.25.56-1.25 1.25v6.75h5.75a2.25 2.25 0 0 0 2.25-2.25zm-11-11.75a.75.75 0 0 0-.75-.75h-8a.75.75 0 0 0-.75.75v8a.75.75 0 0 0 1.5 0V5.56l6.22 6.22a.75.75 0 1 0 1.06-1.06L5.56 4.5h6.19a.75.75 0 0 0 .75-.75"/></svg>
                        </span>
                    </div>
                    <Motion.div initial={{ x: "100%" }} animate={{ x: showList() ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }} class="mediaList">
                        <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
                            <div class="panel-title" style={{ display: "flex", width: "100%", "align-items": "center", "flex-direction": "row" }}>
                                <div style={{ cursor: "pointer" }} onClick={()=>setShowList(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path stroke-width="1" fill="currentColor" d="M9.193 9.249a.75.75 0 0 1 1.059-.056l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.004-1.115l1.048-.942H6.75a.75.75 0 1 1 0-1.5h3.546l-1.048-.942a.75.75 0 0 1-.055-1.06M22 17.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75zm-2.75 1.25c.69 0 1.25-.56 1.25-1.25V6.749c0-.69-.56-1.25-1.25-1.25h-3.254V18.5zm-4.754 0v-13H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25z"/></svg>
                                </div>
                                <h3 style={{ flex: 1, "text-align": "center" }}>Media List</h3>
                            </div>
                            <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", padding: "1rem", flex: 1, "overflow-y": "auto" }}>
                                { appState().directory!.files.filter((file)=> isVideoOrAudio(file.name)).map((file)=>(<FileInfoView file={file}/>)) }
                            </div>
                        </div>
                    </Motion.div>
                </div>
            </Show>
        </div>
    );
}

export default Streaming;