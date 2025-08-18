import { Show, type Component } from "solid-js";
import type { DirectoryFile } from "../utils/files_repository";
import { isVideoOrAudio } from "../utils/util";
import { useAppContext } from "../providers/app";

interface FileContextMenuProps{
    x?: string, y?: string,
    file?: DirectoryFile
}

const FileContextMenu: Component<FileContextMenuProps> = ({ x, y, file }) =>{
    const { goto, stream, deleteFile } = useAppContext();
    
    const download = () =>{
        console.log(file?.path);
        window.location.href = `${file?.path.replaceAll("\\", "/").replace("/files", "download")}`;
    }

    const open = () => {
        if(file?.isDir){
            goto(file!.path);
        }else{
            stream(file!.name);
        }
    }

    const deleteSelf = () => deleteFile(file!.name);

    return (
        <div id="file-context-menu" style={{ left: x, top: y }}>
            <ul>
                <Show when={file?.isDir || isVideoOrAudio(file?.name ?? "")}>
                    <li class="menu-item" id="menu-open" onClick={open}>Open</li>
                </Show>
                <Show when={!file?.isDir}>
                    <li class="menu-item" id="menu-download" onClick={download}>Download</li>
                </Show>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <li class="menu-item" id="menu-copy">Copy</li>
                <li class="menu-item" id="menu-cut">Cut</li>
                <li class="menu-item" id="menu-paste">Paste</li>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <Show when={!file?.isDir}>
                    <li class="menu-item" id="menu-delete" onClick={deleteSelf}>Delete</li>
                </Show>
            </ul>
        </div>
    );
}

export default FileContextMenu;