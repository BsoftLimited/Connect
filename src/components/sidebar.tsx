import { Html } from "@elysiajs/html";
import FilesRepository from "../utils/files_repository";
import HomeIcon from "../vectors/home";
import DeskTopIcon from "../vectors/desktop";
import DocumentSidebarIcon from "../vectors/document_sidebar";
import DownloadIcon from "../vectors/download";
import MusicSidebarIcon from "../vectors/music_sidebar";

const SideBarItem = (props:{ name: string, icon: JSX.Element }) =>{
    return (
        <a href={`/${props.name === "Home" ? "" : props.name}`}>
            <div class="library-item">
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
            {
                FilesRepository.Libraries.map((library)=>{
                    let imageSrc = "/assets/vectors/streamline-freehand--home-chimney-2.svg";
                    switch(library){
                        case "Documents":
                            imageSrc = "/assets/vectors/streamline-freehand--book-library-shelf-1.svg";
                            break;
                        case "Downloads":
                            imageSrc = "/assets/vectors/streamline-freehand--drawer-download.svg";
                            break;
                        case "Music":
                            imageSrc = "/assets/vectors/streamline-freehand--paginate-filter-music.svg";
                            break;
                        case "Pictures":
                            imageSrc = "/assets/vectors/streamline-freehand--picture-double-landscape.svg";
                            break;
                        case "Desktop":
                            imageSrc = "/assets/vectors/streamline-freehand--desktop-monitor.svg";
                            break;
                        case "Videos":
                            imageSrc = "/assets/vectors/streamline-freehand--video-file-camera.svg";
                            break;
                    }

                    return (
                        
                    );
                })
            }
        </div>
    );
}

export default SideBar;