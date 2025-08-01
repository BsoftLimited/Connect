import { Html } from "@elysiajs/html";
import { DirectoryDetails } from "../utils/files_repository";
import FileView from "../components/file";
import TopBar from "../components/topbar";

const Streaming = (props: { fileName: string, path: string, directory: DirectoryDetails }) => {
    return (
        <html lang="en">
            <head>
                <title>Connect | Streaming - {props.fileName}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/styles/home.css" />
                <link rel="stylesheet" href="/assets/styles/streaming.css" />
            </head>
            <body style={{ display: "flex", width: "100vw", height: "100vh", flexDirection: "column", gap: "2rem", overflow: "hidden" }}>
                <TopBar />
                <div style={{ display: "flex", flex: 1, flexDirection: "row", width: "100%", overflow: "hidden" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ maxWidth: "800px", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3>Playing : {props.fileName}</h3>
                            <p>Click on the video to play or pause.</p>
                            <div class="video-container">
                                <video id="custom-video" src={`/files/${props.path}`}></video>
                                <div class="custom-controls">
                                    <button class="play-pause">Play</button>
                                    <input type="range" class="seek-bar" value="0" />
                                    <button class="mute">Mute</button>
                                    <input type="range" class="volume-bar" min="0" max="1" step="0.1" value="1" />
                                    <button class="fullscreen">Fullscreen</button>
                                    <span class="time-display">00:00 / 00:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ overflow: "auto", width: "24rem" }}>
                        { props.directory.files.filter((file)=> file.name.endsWith(".mp4") || file.name.endsWith(".mp3")).map((file)=>(<FileView file={file}/>)) }
                    </div>
                </div>
                <script src="/assets/js/streaming.js"></script>
            </body>
        </html>
    );
}

export default Streaming;