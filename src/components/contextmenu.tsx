import type { Component } from "solid-js";

interface ContextMenuProps{
    x?: string, y?: string,
    upload?: ()=>void
}

const ContextMenu: Component<ContextMenuProps> = ({ x, y, upload }) =>{
    return (
        <div id="file-context-menu" style={{ left: x, top: y }}>
            <ul>
                <li class="menu-item" id="menu-upload" onClick={upload}>Upload</li>
                <li class="menu-item" id="menu-cut">Create Folder</li>
                <li class="menu-item" id="menu-paste">Refresh</li>
                <li class="menu-separator" style={{ "border-top": "1px solid #eee", height: "1px" }}></li>
                <li class="menu-item" id="menu-directory-delete">Delete</li>
            </ul>
        </div>
    );
}

export default ContextMenu;