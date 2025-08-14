import { Motion } from "@motionone/solid";

import { useAppContext } from "../providers/app";
import { useUploadContext } from "../providers/upload";
import { createSignal, type Component, JSX } from "solid-js";

interface UploadProps{
    open: boolean,
    onClocse: ()=> void
}

const Upload: Component<UploadProps> = (props) =>{
    const appContext = useAppContext();
    const uploadContext = useUploadContext();

    const [fileName, setFileName] = createSignal<string>();
    let fileInputRef: HTMLInputElement | undefined = undefined;

    const onInputRef = (element: HTMLInputElement) => {
        console.log("I am ready");
        fileInputRef = element;
    }

    // Trigger file input when label is clicked
    const triggerFileInput = () => {
        fileInputRef?.click(); // Programmatically click the hidden input
    };

    // Update the filename when a file is selected
    const handleFileChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            setFileName(files[0]!.name);
        } else {
            setFileName(undefined);
        }
    };

    return (
        <Motion.div initial={{ x: "100%" }} animate={{ x: props.open ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }} class="panel">
            <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
                <div style={{ display: "flex", width: "100%", "align-items": "center", "flex-direction": "row" }}>
                    <div onClick={props.onClocse}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path stroke-width="1" fill="currentColor" d="M9.193 9.249a.75.75 0 0 1 1.059-.056l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.004-1.115l1.048-.942H6.75a.75.75 0 1 1 0-1.5h3.546l-1.048-.942a.75.75 0 0 1-.055-1.06M22 17.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75zm-2.75 1.25c.69 0 1.25-.56 1.25-1.25V6.749c0-.69-.56-1.25-1.25-1.25h-3.254V18.5zm-4.754 0v-13H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25z"/></svg>
                    </div>
                    <h3 style={{ flex: 1, "text-align": "center" }}>File Upload</h3>
                </div>
                <div style={{ flex: 1, display: "flex", "flex-direction": "column", "justify-content": "center" }}>
                    <form onSubmit={uploadContext.upload} style={{ display: "flex", "flex-direction": "column", "align-items": "center", width: "100%", gap: "20px" }}>
                        <div class="upload-icon-container" onClick={triggerFileInput} style={{ cursor: "pointer" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="6rem" height="6rem" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4.5 11.5a3 3 0 0 1 3-3h8.718a4 4 0 0 1 2.325.745l4.914 3.51a4 4 0 0 0 2.325.745H40.5a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-33a3 3 0 0 1-3-3z" stroke-width="1"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 33.5v-14m6.167 6.167L24 19.5l-6.167 6.167" stroke-width="1"/></svg>
                        </div>
                        <div style={{ display: "none" }}>
                            <input type="file" name="file" ref={onInputRef} onChange={handleFileChange} required />
                            <input type="text" name="dest" value={appContext.state().directory!.path} style={{ display: "none" }}/>
                        </div>
                        <div class="upload-label">{fileName() ?? "Drag and Drop or click below to choose" }</div>
                        <button type="submit" class="upload-button">Upload</button>
                    </form>
                    <div>
                        <div class="progress-container">
                            <div class="progress-bar" style={`width: ${uploadContext.uploadState().progress}%`}></div>
                        </div>
                        <p class="progress-text">{uploadContext.uploadState().progress}% complete - {uploadContext.uploadState().status}</p>
                    </div>
                    {uploadContext.uploadState().file && (
                        <div class="mt-6 p-4 bg-green-50 rounded-md">
                            <h2 class="text-lg font-semibold mb-2">Upload Complete!</h2>
                            <p>Filename: {uploadContext.uploadState().file?.filename}</p>
                            <p>Size: {(uploadContext.uploadState().file!.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <p>Download:{' '}
                                <a href={uploadContext.uploadState().file?.path} class="text-blue-600 hover:underline" target="_blank">{uploadContext.uploadState().file?.path}</a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Motion.div>
    );
}

export default Upload;