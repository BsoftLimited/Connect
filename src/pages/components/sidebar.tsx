import HomeIcon from "../vectors/home";
import DeskTopIcon from "../vectors/desktop";
import DocumentSidebarIcon from "../vectors/document_sidebar";
import DownloadIcon from "../vectors/download";
import MusicSidebarIcon from "../vectors/music_sidebar";
import PicturesIcon from "../vectors/pictures";
import VideosIcon from "../vectors/videos";
import type { JSX } from "solid-js";
import { useAppContext } from "../providers/app";

const SideBarItem = (props:{ name: string, icon: JSX.Element }) =>{
    const { goto } = useAppContext();

    const clicked = () => goto(`/${props.name === "Home" ? "" : props.name}`);
    
    return (
        <div class="library-item" onClick={clicked}>
            <div class="library-item-content">
                {props.icon}
                <p class="library-item-label" style={{ "font-size": "1.1rem" }}>{props.name}</p>
            </div>
        </div>
    );
}

const SideBar = () =>{
    return (
        <div class="side-bar">
            <div class="siderbar-header">
                <h2>Library</h2>
            </div>
            <SideBarItem name={"Home"} icon={<HomeIcon />} />
            <SideBarItem name={"Desktop"} icon={<DeskTopIcon />} />
            <SideBarItem name={"Documents"} icon={<DocumentSidebarIcon />} />
            <SideBarItem name={"Downloads"} icon={<DownloadIcon />} />
            <SideBarItem name={"Music"} icon={<MusicSidebarIcon />} />
            <SideBarItem name={"Pictures"} icon={<PicturesIcon />} />
            <SideBarItem name={"Videos"} icon={<VideosIcon />} />
        </div>
    );
}

export default SideBar;