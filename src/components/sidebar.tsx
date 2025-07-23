import { Html } from "@elysiajs/html";
import FilesRepository from "../utils/files_repository";

const SideBar = () =>{
    return (
        <div style={{ display: "flex", height: "100%", minWidth: "200px", flexDirection: "column", gap: "20px", borderRight: '1px solid #ccc', padding: "20px" }}>
            <div>
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
                            <div style={{ display: "flex", flexDirection: "row", gap: "12px", alignItems: "center" }}>
                                <image src={imageSrc} alt="File Icon" style={{ width: '32px', height: '32px' }} />
                                <p style={{ fontSize: "18px" }}>{library}</p>
                            </div>
                        </a>
                    );
                })
            }
        </div>
    );
}

export default SideBar;