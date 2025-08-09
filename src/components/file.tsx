import type { DirectoryFile } from "../utils/files_repository";
import FolderFill from "../vectors/folder_fill";
import FolderEmpty from "../vectors/foolder_empty";
import ArchiveIcon from "../vectors/archive";
import TextIcon from "../vectors/text";
import VideoIcon from "../vectors/video";
import DocumentIcon from "../vectors/document";
import ImageIcon from "../vectors/image";
import MusicIcon from "../vectors/music";
import GenericFileIcon from "../vectors/file";
import { useAppContext } from "../providers/app";
import { For, Show } from "solid-js";

interface FileProps {
   file : DirectoryFile;

   onContext: (x: number, y: number)=>void
}

// funtion to convert bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FileIcon = (props: { file: DirectoryFile }) => {
    const size = "5.8rem";

    if(props.file.isDir && props.file.size === 0){
        return <FolderEmpty size={size} />;
    }else if (props.file.isDir && props.file.size > 0) {
        return <FolderFill size={size} />;
    }else if (props.file.name.endsWith('.pdf') || props.file.name.endsWith('.docx') || props.file.name.endsWith('.xlsx')) {
        return <DocumentIcon size={size} />;
    } else if (props.file.name.endsWith('.txt')) {
        return <TextIcon size={size} />;
    } else if (props.file.name.endsWith('.jpg') || props.file.name.endsWith('.png') || props.file.name.endsWith('.webp')) {
        return <ImageIcon size={size} />;
    }else if (props.file.name.endsWith('.mp3') || props.file.name.endsWith('.wav')) {
        return <MusicIcon size={size} />;
    } else if (props.file.name.endsWith('.mp4') || props.file.name.endsWith('.avi') || props.file.name.endsWith('.mkv')) {
        return <VideoIcon size={size} />;
    }else if (props.file.name.endsWith('.zip') || props.file.name.endsWith('.rar')) {
        return <ArchiveIcon size={size} />;
    }

    return <GenericFileIcon size={size} />; // Default icon for unknown file types
}

const FileView  = (props: FileProps) => {
    const { goto } = useAppContext();

    const clicked = () => goto(props.file.path);
    const context = (event: PointerEvent) =>{
        event.preventDefault();
        event.stopPropagation();

        props.onContext(event.pageX, event.pageY);
        console.log("context clicked from file");
    }

    const names = () =>{
        let nameWraps: string[] = [];
        if (props.file.name.length > 24) {
            nameWraps = props.file.name.match(/.{1,24}/g) || [];
        }else {
            nameWraps = [props.file.name]; 
        }
        return nameWraps;
    }
    
    return (
        <div onclick={clicked} onContextMenu={context} class={props.file.isDir ? "folder" : "file" } id={props.file.name}>
            <div style={{ display:"flex", "flex-direction":"column", "align-items":"center", gap: "0.5rem", "border-radius": '5px', "text-align": 'center', "text-decoration": 'none', color: 'black' }}>
                <FileIcon file={props.file} />
                <p style={{ "text-align": "center", "font-size": "0.8rem", "font-weight": 300, "letter-spacing": "1.5" }}>
                    <For each={names()}>
                        {((line, index) => (<span>{line}<br/></span>))}
                    </For>
                </p>
                <Show when={!props.file.isDir}>
                    <p style={{ "text-wrap": "wrap", "font-size": "0.8rem", "font-weight": "bold" }}>{`File size: ${formatBytes(props.file.size)}`}</p>
                </Show>
                <Show when={props.file.isDir}>
                    <p style={{ "text-wrap": "wrap", "font-size": "0.8rem", "font-weight": "bold" }}>{`${props.file.size} files`}</p>
                </Show>
            </div>
        </div>   
    );
}

export default FileView;