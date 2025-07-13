import { Html } from "@elysiajs/html";

interface FileProps {
    name: string;
}

const FileView  = (props: FileProps) => {
    let imageSrc = "/vectors/streamline-freehand-color--office-file-sheet.svg";

    if (props.name.endsWith('.pdf') || props.name.endsWith('.docx') || props.name.endsWith('.xlsx')) {
        imageSrc = "/vectors/streamline-freehand-color--bookmarks-document.svg";
    } else if (props.name.endsWith('.txt')) {
        imageSrc = "/vectors/streamline-freehand-color--office-file-text.svg";
    } else if (props.name.endsWith('.jpg') || props.name.endsWith('.png') || props.name.endsWith('.webp')) {
        imageSrc = "/vectors/streamline-freehand-color--photo-frame-landscape.svg";
    }else if (props.name.endsWith('.mp3') || props.name.endsWith('.wav')) {
        imageSrc = "/vectors/streamline-freehand-color--paginate-filter-music.svg";
    } else if (props.name.endsWith('.mp4') || props.name.endsWith('.avi') || props.name.endsWith('.mkv')) {
        imageSrc = "/vectors/streamline-freehand-color--video-player-movie.svg";
    }else if (props.name.endsWith('.zip') || props.name.endsWith('.rar')) {
        imageSrc = "/vectors/streamline-freehand-color--layers-stacked-1.svg";
    }
    
    return (
        <a href={`/assets/${props.name}`} style={{ textDecoration: 'none' }}>
            <div class="file" style={{ display:"flex", flexDirection:"column", alignItems:"center", border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '180px' }}>
                <image src={imageSrc} alt="File Icon" style={{ width: '80px', height: '80px' }} />
                <p  style={{ textWrap: "wrap" }}>{props.name}</p>
            </div>
        </a>    );
}

export default FileView;