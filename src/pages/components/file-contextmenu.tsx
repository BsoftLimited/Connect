import { Show, type Component } from "solid-js";
import type { DirectoryFile } from "../../utils/files_repository";
import { isVideoOrAudio } from "../../utils/util";
import { useAppContext } from "../providers/app";

interface FileContextMenuProps{
    x?: string, y?: string,
    file?: DirectoryFile
}

const FileContextMenu: Component<FileContextMenuProps> = (props) =>{
    const { goto, stream, deleteFile, appState, saveClipboard, paste } = useAppContext();
    
    const download = () =>{
        console.log(props.file?.path);
        window.location.href = `/download${props.file?.path.replaceAll("\\", "/")}`;
    }

    const open = () => {
        if(props.file?.isDir){
            goto(props.file!.path);
        }else{
            stream(props.file!.name);
        }
    }

    const deleteSelf = () => deleteFile(props.file!.name);
    const copy = () => saveClipboard({ file: props.file!, command: "copy" });
    const move = () => saveClipboard({ file: props.file!, command: "move" });
    const pasteInto = () => paste(props.file);

    return (
        <div id="file-context-menu" style={{ left: props.x, top: props.y }}>
            <ul>
                <Show when={props.file?.isDir || isVideoOrAudio(props.file?.name ?? "")}>
                    <li class="menu-item" id="menu-open" onClick={open}>Open</li>
                </Show>
                <Show when={!props.file?.isDir}>
                    <li class="menu-item" id="menu-download" onClick={download}>Download</li>
                </Show>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <li class="menu-item" id="menu-copy" onClick={copy}>Copy</li>
                <li class="menu-item" id="menu-cut" onClick={move}>Move</li>
                <Show when={appState().clipboard && props.file?.isDir}>
                    <li class="menu-item" id="menu-paste" onClick={pasteInto}>Paste</li>
                </Show>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <Show when={!props.file?.isDir}>
                    <li class="menu-item" id="menu-delete" onClick={deleteSelf}>Delete</li>
                </Show>
            </ul>
        </div>
    );
}

export default FileContextMenu;