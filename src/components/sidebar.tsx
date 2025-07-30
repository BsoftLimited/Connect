import { Html } from "@elysiajs/html";
import FilesRepository from "../utils/files_repository";
import HomeIcon from "../vectors/home";
import DeskTopIcon from "../vectors/desktop";
import DocumentSidebarIcon from "../vectors/document_sidebar";
import DownloadIcon from "../vectors/download";
import MusicSidebarIcon from "../vectors/music_sidebar";
import PicturesIcon from "../vectors/pictures";
import VideosIcon from "../vectors/videos";

const SideBarItem = (props:{ name: string, icon: JSX.Element }) =>{
    return (
        <a class="library-item" href={`/${props.name === "Home" ? "" : props.name}`}>
            <div class="library-item-content">
                {props.icon}
                <p class="library-item-label" style={{ fontSize: "1.1rem" }}>{props.name}</p>
            </div>
        </a>
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