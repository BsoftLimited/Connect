import { Html } from "@elysiajs/html";
import FileView from "./file";
import { DirectoryDetails } from "../utils/files_repository";

interface DirectoryProps {
    details: DirectoryDetails
}

const Directory = (props: DirectoryProps) => {
    return (
        <div>
            <h1>{props.details.name}</h1>
            <p>Files in your { props.details.name } folder: {props.details.files.length}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                { props.details.files.map(file => (<FileView file={file} />))}
            </div>
        </div>
    );
}

export default Directory;