import { Html } from "@elysiajs/html";
import FileView from "./file";

interface DirectoryProps {
    name: string;
    files: string[];
}

const Directory = (props: DirectoryProps) => {
    return (
        <div>
            <h1>{props.name}</h1>
            <p>Files in your { props.name } folder:</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                { props.files.map(file => (<FileView name={file} />)
                )}
            </div>
        </div>
    );
}

export default Directory;