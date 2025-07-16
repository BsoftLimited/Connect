import { Html } from "@elysiajs/html";
import { DirectoryFile } from "../utils/files_repository";

interface FileProps {
   file : DirectoryFile;
}

const FileView  = (props: FileProps) => {
    let imageSrc = "/assets/vectors/streamline-freehand--notes-paper.svg";

    if(props.file.isDir){
        imageSrc = "/assets/vectors/streamline-freehand--office-folder.svg";
    }else if (props.file.name.endsWith('.pdf') || props.file.name.endsWith('.docx') || props.file.name.endsWith('.xlsx')) {
        imageSrc = "/assets/vectors/streamline-freehand--office-file-sheet.svg";
    } else if (props.file.name.endsWith('.txt')) {
        imageSrc = "/assets/vectors/streamline-freehand--office-file-text.svg";
    } else if (props.file.name.endsWith('.jpg') || props.file.name.endsWith('.png') || props.file.name.endsWith('.webp')) {
        imageSrc = "/assets/vectors/streamline-freehand--photo-frame-hang.svg";
    }else if (props.file.name.endsWith('.mp3') || props.file.name.endsWith('.wav')) {
        imageSrc = "/assets/vectors/streamline-freehand--paginate-filter-music.svg";
    } else if (props.file.name.endsWith('.mp4') || props.file.name.endsWith('.avi') || props.file.name.endsWith('.mkv')) {
        imageSrc = "/assets/vectors/streamline-freehand--video-player-smartphone-horizontal.svg";
    }else if (props.file.name.endsWith('.zip') || props.file.name.endsWith('.rar')) {
        imageSrc = "/assets/vectors/streamline-freehand--layers-stacked-1.svg";
    }
    
    return (
        <a href={props.file.path} style={{ textDecoration: 'none' }}>
            <div class="file" style={{ display:"flex", flexDirection:"column", alignItems:"center", border: '1px solid #ccc', padding: '10px', gap: "10px", borderRadius: '5px', width: '180px' }}>
                <image src={imageSrc} alt="File Icon" style={{ width: '70px', height: '70px' }} />
                <p  style={{ textWrap: "wrap", fontSize: "13px", textAlign: "center" }}>{props.file.name}</p>
                { !props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "12px" }}>{`File size: ${props.file.size}`}</p>) }
                { props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "12px" }}>{`${props.file.size} files`}</p>) }
            </div>
        </a>   
    );
}

export default FileView;