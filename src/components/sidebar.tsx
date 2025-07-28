import { Html } from "@elysiajs/html";
import FilesRepository from "../utils/files_repository";

const SideBar = () =>{
    return (
        <div class="side-bar">
            <div class="siderbar-header">
                <h2>Library</h2>
            </div>
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
                        <a href={`/${library === "Home" ? "" : library}`}>
                            <div class="library-item">
                                <image src={imageSrc} alt="File Icon" style={{ width: '1.8rem', height: '1.8rem', color: "inherit" }} />
                                <p class="library-item-label" style={{ fontSize: "1.1rem" }}>{library}</p>
                            </div>
                        </a>
                    );
                })
            }
        </div>
    );
}

export default SideBar;