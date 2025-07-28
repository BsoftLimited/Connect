import { Html } from "@elysiajs/html";
import { DirectoryFile } from "../utils/files_repository";
import FolderFill from "../vectors/folder_fill";
import FolderEmpty from "../vectors/foolder_empty";
import ArchiveIcon from "../vectors/archive";
import TextIcon from "../vectors/text";
import VideoIcon from "../vectors/video";
import DocumentIcon from "../vectors/document";
import ImageIcon from "../vectors/image";
import MusicIcon from "../vectors/music";
import GenericFileIcon from "../vectors/file";

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

const FileIcon = (props: { file: DirectoryFile }) => {
    const size = "5.8rem";

    if(props.file.isDir && props.file.size === 0){
        return <FolderEmpty size={size} />;
    }else if (props.file.isDir && props.file.size > 0) {
        return <FolderFill size={size} />;
    }else if (props.file.name.endsWith('.pdf') || props.file.name.endsWith('.docx') || props.file.name.endsWith('.xlsx')) {
        return <DocumentIcon size={size} />;
    } else if (props.file.name.endsWith('.txt')) {
        return <TextIcon size={size} />;
    } else if (props.file.name.endsWith('.jpg') || props.file.name.endsWith('.png') || props.file.name.endsWith('.webp')) {
        return <ImageIcon size={size} />;
    }else if (props.file.name.endsWith('.mp3') || props.file.name.endsWith('.wav')) {
        return <MusicIcon size={size} />;
    } else if (props.file.name.endsWith('.mp4') || props.file.name.endsWith('.avi') || props.file.name.endsWith('.mkv')) {
        return <VideoIcon size={size} />;
    }else if (props.file.name.endsWith('.zip') || props.file.name.endsWith('.rar')) {
        return <ArchiveIcon size={size} />;
    }

    return <GenericFileIcon size={size} />; // Default icon for unknown file types
}

const FileView  = (props: FileProps) => {
    let nameWraps: string[] = [];
    if (props.file.name.length > 24) {
        nameWraps = props.file.name.match(/.{1,24}/g) || [];
    }else {
        nameWraps = [props.file.name]; 
    }
    
    return (
        <a href={props.file.path}>
            <div class={props.file.isDir ? "folder" : "file" } id={props.file.name} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: "10px", borderRadius: '5px', textAlign: 'center', textDecoration: 'none', color: 'black' }}>
                <FileIcon file={props.file} />
                <p style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 300, letterSpacing: "1.5", fontFamily: "sans-serif" }}>{nameWraps.map((line, index) => (
                    <span>{line}<br/></span>
                ))}</p>
                { !props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "0.8rem", fontWeight: "bold" }}>{`File size: ${formatBytes(props.file.size)}`}</p>) }
                { props.file.isDir && (<p  style={{ textWrap: "wrap", fontSize: "0.8rem", fontWeight: "bold" }}>{`${props.file.size} files`}</p>) }
            </div>
        </a>   
    );
}

export default FileView;