import { createSignal } from "solid-js";
import { useAppContext } from "../providers/app";

interface FileInfo{
    filename: string,
    size: number,
    path: string
}

const Upload = () =>{
    const { state } = useAppContext();

    const [progress, setProgress] = createSignal(0);
    const [uploadStatus, setUploadStatus] = createSignal('');
    const [fileInfo, setFileInfo] = createSignal<FileInfo>();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const file = formData.get('file') as File;
    
        if (!file) return;

        formData.set("dest", state().directory!.path);
    
        setUploadStatus('Uploading...');
        setFileInfo(undefined);
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
    
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setProgress(percentComplete);
            }
        });
    
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                setFileInfo(response);
                setUploadStatus('Upload complete!');
            } else {
                setUploadStatus(`Error: ${xhr.responseText}`);
            }
        });
    
        xhr.addEventListener('error', () => setUploadStatus('Upload failed'));
    
        xhr.send(formData);
    };
    

    return (
        <div style={{ display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column", width: "100%", height: "100%" }}>
            <h1 class="text-2xl font-bold mb-4">File Upload with Progress</h1>
            <form onSubmit={handleSubmit} class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Choose a file</label>
                    <input type="file" name="file" required class="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Upload</button>
            </form>
            <div class="mt-6">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style={`width: ${progress()}%`}></div>
                </div>
                <p class="text-sm text-gray-600 mt-2">{progress()}% complete - {uploadStatus()}</p>
            </div>
            {fileInfo() && (
                <div class="mt-6 p-4 bg-green-50 rounded-md">
                    <h2 class="text-lg font-semibold mb-2">Upload Complete!</h2>
                    <p>Filename: {fileInfo()?.filename}</p>
                    <p>Size: {(fileInfo()!.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p>Download:{' '}
                        <a href={fileInfo()?.path} class="text-blue-600 hover:underline" target="_blank">{fileInfo()?.path}</a>
                    </p>
                </div>
            )}
        </div>
    );
}

export default Upload;