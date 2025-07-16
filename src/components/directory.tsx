import { Html } from "@elysiajs/html";
import FileView from "./file";
import { DirectoryDetails } from "../utils/files_repository";

export interface DirectoryProps {
    details: DirectoryDetails
}

const Directory = (props: DirectoryProps) => {
    return (
        <div style={{ padding: "10px", overflow: "auto", width: "100%", height: "100%" }}>
            <h1>{props.details.name}</h1>
            <p>Files in your { props.details.name } folder: {props.details.files.length}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                { props.details.files.map(file => (<FileView file={file} />))}
            </div>
        </div>
    );
}

export default Directory;