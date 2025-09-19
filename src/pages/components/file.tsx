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
import { formatBytes, isVideoOrAudio } from "../../utils/util";
import type { DirectoryFile } from "../../repositories/files_repository";

interface FileProps {
   file : DirectoryFile;

   onContext: (event: PointerEvent)=>void
}

const FileIcon = (props: { file: DirectoryFile }) => {
    const size = "5.8rem";

    if(props.file.isDir && (props.file.fileCount! + props.file.folderCount!) === 0){
        return <FolderEmpty size={size} />;
    }else if (props.file.isDir && (props.file.fileCount! + props.file.folderCount!) > 0) {
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
    const { goto, stream } = useAppContext();

    const clicked = () => {
        if(props.file.isDir){
            goto(props.file.path);
        }else if(isVideoOrAudio(props.file.name)){
            stream(props.file.name);
        }else{
            window.location.href = `files${props.file.path.replaceAll("\\", "/")}`;
        }
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
        <div onclick={clicked} onContextMenu={props.onContext} class={props.file.isDir ? "folder" : "file" } id={props.file.name}>
            <div style={{ display:"flex", "flex-direction":"column", "align-items":"center", gap: "0.3rem", "border-radius": '5px', "text-align": 'center', "text-decoration": 'none', color: 'black' }}>
                <FileIcon file={props.file} />
                <p style={{ "text-align": "center", "font-size": "1rem", "font-weight": 300, "letter-spacing": "1.4" }}>
                    <For each={names()}>
                        {((line, index) => (<span>{line}<br/></span>))}
                    </For>
                </p>
                <Show when={!props.file.isDir}>
                    <p style={{ "text-wrap": "wrap", "font-size": "0.8rem", "font-weight": "bold" }}>{`File size: ${formatBytes(props.file.size!)}`}</p>
                </Show>
                <Show when={props.file.isDir}>
                    <p style={{ display:"flex", "flex-direction": "row", "align-items": "center", gap: "2px", "text-wrap": "wrap", "font-size": "0.8rem", "font-weight": "bold" }}>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <path fill="currentColor" fill-rule="evenodd" d="M6.86 1.25h.127c.351 0 .577 0 .798.02a4.75 4.75 0 0 1 2.59 1.073c.17.142.33.302.579.55l.576.577c.846.845 1.171 1.161 1.547 1.37q.328.182.689.286c.413.117.866.124 2.062.124h.425c1.273 0 2.3 0 3.111.102c.841.106 1.556.332 2.144.86q.147.133.28.28c.529.588.754 1.303.86 2.144c.102.812.102 1.838.102 3.111v2.31c0 1.837 0 3.293-.153 4.432c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H9.944c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433V6.86c0-.797 0-1.303.082-1.74A4.75 4.75 0 0 1 5.12 1.331c.438-.082.944-.082 1.74-.082m.09 1.5c-.917 0-1.271.003-1.553.056a3.25 3.25 0 0 0-2.59 2.591c-.054.282-.057.636-.057 1.553V14c0 1.907.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14h4c1.907 0 3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.027.14-2.382.14-4.289v-2.202c0-1.336-.001-2.267-.09-2.975c-.087-.689-.246-1.06-.487-1.328a2 2 0 0 0-.168-.168c-.268-.241-.64-.4-1.328-.487c-.707-.089-1.639-.09-2.975-.09h-.484c-1.048 0-1.724 0-2.363-.182c-.35-.1-.689-.24-1.008-.417c-.58-.324-1.058-.801-1.8-1.543l-.077-.078l-.55-.55a8 8 0 0 0-.503-.482a3.25 3.25 0 0 0-1.771-.734a8 8 0 0 0-.696-.014m5.3 7.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/>
                            </svg>
                        </span>
                        <span>{props.file.folderCount}</span>
                        <span style={{ "margin-left": "6px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <g fill="none">
                                    <path fill="currentColor" d="m15.393 4.054l-.502.557zm3.959 3.563l-.502.557zm2.302 2.537l-.685.305zM3.172 20.828l.53-.53zm17.656 0l-.53-.53zM14 21.25h-4v1.5h4zM2.75 14v-4h-1.5v4zm18.5-.437V14h1.5v-.437zM14.891 4.61l3.959 3.563l1.003-1.115l-3.958-3.563zm7.859 8.952c0-1.689.015-2.758-.41-3.714l-1.371.61c.266.598.281 1.283.281 3.104zm-3.9-5.389c1.353 1.218 1.853 1.688 2.119 2.285l1.37-.61c-.426-.957-1.23-1.66-2.486-2.79zM10.03 2.75c1.582 0 2.179.012 2.71.216l.538-1.4c-.852-.328-1.78-.316-3.248-.316zm5.865.746c-1.086-.977-1.765-1.604-2.617-1.93l-.537 1.4c.532.204.98.592 2.15 1.645zM10 21.25c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812l-1.06 1.06c.748.75 1.697 1.081 2.869 1.239c1.15.155 2.625.153 4.489.153zM1.25 14c0 1.864-.002 3.338.153 4.489c.158 1.172.49 2.121 1.238 2.87l1.06-1.06c-.422-.424-.676-1.004-.811-2.01c-.138-1.027-.14-2.382-.14-4.289zM14 22.75c1.864 0 3.338.002 4.489-.153c1.172-.158 2.121-.49 2.87-1.238l-1.06-1.06c-.424.422-1.004.676-2.01.811c-1.027.138-2.382.14-4.289.14zM21.25 14c0 1.907-.002 3.262-.14 4.29c-.135 1.005-.389 1.585-.812 2.008l1.06 1.06c.75-.748 1.081-1.697 1.239-2.869c.155-1.15.153-2.625.153-4.489zm-18.5-4c0-1.907.002-3.261.14-4.29c.135-1.005.389-1.585.812-2.008l-1.06-1.06c-.75.748-1.081 1.697-1.239 2.869C1.248 6.661 1.25 8.136 1.25 10zm7.28-8.75c-1.875 0-3.356-.002-4.511.153c-1.177.158-2.129.49-2.878 1.238l1.06 1.06c.424-.422 1.005-.676 2.017-.811c1.033-.138 2.395-.14 4.312-.14z"/>
                                    <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M6 14.5h8M6 18h5.5"/>
                                    <path stroke="currentColor" stroke-width="1.5" d="M13 2.5V5c0 2.357 0 3.536.732 4.268S15.643 10 18 10h4"/>
                                </g>
                            </svg>
                        </span>
                        <span>{props.file.fileCount}</span>
                    </p>
                </Show>
            </div>
        </div>   
    );
}

export default FileView;