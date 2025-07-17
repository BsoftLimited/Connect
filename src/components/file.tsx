import { Html } from "@elysiajs/html";
import { DirectoryFile } from "../utils/files_repository";

interface FileProps {
   file : DirectoryFile;
}

// funtion to convert bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

    let nameWraps: string[] = [];
    if (props.file.name.length > 24) {
        nameWraps = props.file.name.match(/.{1,20}/g) || [];
    }else {
        nameWraps = [props.file.name]; 
    }
    
    return (
        <a href={props.file.path}>
            <div class="file" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: "10px", borderRadius: '5px', padding: '10px', border: '1px solid #ccc', textAlign: 'center', textDecoration: 'none', color: 'black' }}>
                <image src={imageSrc} alt="File Icon" style={{ width: '60px', height: '60px', color: "grey" }} />
                <p style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", width: "150px", fontFamily: "sans-serif" }}>{nameWraps.map((line, index) => (
                    <span>{line}<br/></span>
                ))}</p>
                { !props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "12px" }}>{`File size: ${formatBytes(props.file.size)}`}</p>) }
                { props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "12px" }}>{`${props.file.size} files`}</p>) }
            </div>
        </a>   
    );
}

export default FileView;