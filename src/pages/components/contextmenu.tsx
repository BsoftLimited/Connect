import { Show, type Component, type JSX } from "solid-js";
import { useAppContext } from "../providers/app";
import { useUserContext } from "../providers/user";

interface ContextMenuProps{
    x?: string, y?: string,
    delete?: JSX.EventHandler<HTMLElement, MouseEvent>
    upload?: JSX.EventHandler<HTMLElement, MouseEvent>
    create?: JSX.EventHandler<HTMLElement, MouseEvent>
}

const ContextMenu: Component<ContextMenuProps> = (props) =>{
    const { appState, paste, reload } = useAppContext();
    const { userState } = useUserContext();

    const pasteInto = () => paste();
    
    return (
        <div id="file-context-menu" style={{ left: props.x, top: props.y }}>
            <ul>
                <Show when={userState().user?.accessLevel === "read-write"}>
                    <li class="menu-item" id="menu-upload" onClick={props.upload}>Upload</li>
                    <li class="menu-item" id="menu-create" onClick={props.create}>Create Folder</li>
                </Show>
                <li class="menu-item" id="menu-refresh" onClick={reload}>Refresh</li>
                <Show when={appState().clipboard}>
                    <li class="menu-item" id="menu-paste" onClick={pasteInto}>Paste</li>
                </Show>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <Show when={userState().user?.accessLevel === "read-write"}>
                    <li class="menu-item" id="menu-directory-delete" onClick={props.delete}>Delete</li>
                </Show>
            </ul>
        </div>
    );
}

export default ContextMenu;