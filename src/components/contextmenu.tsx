import { Show, type Component, type JSX } from "solid-js";
import { useAppContext } from "../providers/app";

interface ContextMenuProps{
    x?: string, y?: string,
    delete?: JSX.EventHandler<HTMLElement, MouseEvent>
    upload?: JSX.EventHandler<HTMLElement, MouseEvent>
    create?: JSX.EventHandler<HTMLElement, MouseEvent>
}

const ContextMenu: Component<ContextMenuProps> = (props) =>{
    const { state, paste, reload } = useAppContext();

    const pasteInto = () => paste();
    
    return (
        <div id="file-context-menu" style={{ left: props.x, top: props.y }}>
            <ul>
                <li class="menu-item" id="menu-upload" onClick={props.upload}>Upload</li>
                <li class="menu-item" id="menu-create" onClick={props.create}>Create Folder</li>
                <li class="menu-item" id="menu-refresh" onClick={reload}>Refresh</li>
                <Show when={state().clipboard}>
                    <li class="menu-item" id="menu-paste" onClick={pasteInto}>Paste</li>
                </Show>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <li class="menu-item" id="menu-directory-delete" onClick={props.delete}>Delete</li>
            </ul>
        </div>
    );
}

export default ContextMenu;