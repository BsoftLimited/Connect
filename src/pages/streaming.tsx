import { Html } from "@elysiajs/html";
import { DirectoryDetails } from "../utils/files_repository";
import FileView from "../components/file";

const Streaming = (props: { fileName: string, path: string, directory: DirectoryDetails }) => {
    return (
        <html lang="en">
            <head>
                <title>Connect | Streaming - {props.fileName}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/styles/home.css" />
                <link rel="stylesheet" href="/assets/styles/streaming.css" />
            </head>
            <body style={{ display: "flex", width: "100vw", height: "100vh", flexDirection: "column", gap: "2rem", padding: "2rem", overflow: "hidden" }}>
                <h3>Playing : {props.fileName}</h3>
                <div style={{ display: "flex", flex: 1, flexDirection: "row", overflow: "hidden" }}>
                    <video controls style={{ flex: 1 }}>
                        <source src={`/files/${props.path}`} />
                    </video>
                    <div style={{ overflow: "auto", width: "24rem" }}>
                        { props.directory.files.filter((file)=> file.name.endsWith(".mp4") || file.name.endsWith(".mp3")).map((file)=>(<FileView file={file}/>)) }
                    </div>
                </div>
            </body>
        </html>
    );
}

export default Streaming;