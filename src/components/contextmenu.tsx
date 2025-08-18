import type { Component, JSX } from "solid-js";

interface ContextMenuProps{
    x?: string, y?: string,
    delete?: JSX.EventHandler<HTMLElement, MouseEvent>
    upload?: JSX.EventHandler<HTMLElement, MouseEvent>
}

const ContextMenu: Component<ContextMenuProps> = (props) =>{
    return (
        <div id="file-context-menu" style={{ left: props.x, top: props.y }}>
            <ul>
                <li class="menu-item" id="menu-upload" onClick={props.upload}>Upload</li>
                <li class="menu-item" id="menu-cut">Create Folder</li>
                <li class="menu-item" id="menu-paste">Refresh</li>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <li class="menu-item" id="menu-directory-delete" onClick={props.delete}>Delete</li>
            </ul>
        </div>
    );
}

export default ContextMenu;