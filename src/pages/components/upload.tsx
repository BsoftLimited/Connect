import { Motion } from "@motionone/solid";

import { useAppContext } from "../providers/app";
import { useUploadContext, type FileInfo } from "../providers/upload";
import { createSignal, type Component, JSX, Show, For } from "solid-js";

interface FileInfoViewProps{
    file: FileInfo
}

const FileInfoView: Component<FileInfoViewProps> = ({ file }) =>{
    return (
        <div class="file-info">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 256 256"><path fill="currentColor" d="M160 44a84.11 84.11 0 0 0-76.41 49.12A60.7 60.7 0 0 0 72 92a60 60 0 0 0 0 120h88a84 84 0 0 0 0-168m0 160H72a52 52 0 1 1 8.55-103.3A83.7 83.7 0 0 0 76 128a4 4 0 0 0 8 0a76 76 0 1 1 76 76m34.83-94.83a4 4 0 0 1 0 5.66l-48 48a4 4 0 0 1-5.66 0l-24-24a4 4 0 0 1 5.66-5.66L144 154.34l45.17-45.17a4 4 0 0 1 5.66 0"/></svg>
            </span>
            <div>
                <p style={{ "font-size": "16px" }}>{file.filename}</p>
                <p style={{ "font-size": "12px", "font-weight": 300 }}>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <div style={{ "font-size": "12px", "font-weight": 300 }}>folder: {file.dest}</div>
            </div>
        </div>
    );
}

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
                <div class="panel-title" style={{ display: "flex", width: "100%", "align-items": "center", "flex-direction": "row" }}>
                    <div onClick={props.onClocse} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path stroke-width="1" fill="currentColor" d="M9.193 9.249a.75.75 0 0 1 1.059-.056l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.004-1.115l1.048-.942H6.75a.75.75 0 1 1 0-1.5h3.546l-1.048-.942a.75.75 0 0 1-.055-1.06M22 17.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75zm-2.75 1.25c.69 0 1.25-.56 1.25-1.25V6.749c0-.69-.56-1.25-1.25-1.25h-3.254V18.5zm-4.754 0v-13H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25z"/></svg>
                    </div>
                    <h3 style={{ flex: 1, "text-align": "center" }}>File Upload</h3>
                </div>
                <form onSubmit={uploadContext.upload} style={{ display: "flex", "flex-direction": "column", "align-items": "center", width: "100%",  "padding-top": "3rem", "padding-bottom": "3rem", gap: "1rem", "padding-left": "2rem", "padding-right": "2rem" }}>
                    <div class="upload-icon-container" onClick={triggerFileInput} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="6rem" height="6rem" viewBox="0 0 42 32"><path fill="currentColor" stroke-width="0.4" d="M33.958 12.988C33.531 6.376 28.933 0 20.5 0C12.787 0 6.839 5.733 6.524 13.384C2.304 14.697 0 19.213 0 22.5C0 27.561 4.206 32 9 32h6.5a.5.5 0 0 0 0-1H9c-4.262 0-8-3.972-8-8.5C1 19.449 3.674 14 9 14h1.5a.5.5 0 0 0 0-1H9c-.509 0-.99.057-1.459.139C7.933 7.149 12.486 1 20.5 1C29.088 1 33 7.739 33 14v1.5a.5.5 0 0 0 1 0v-1.509c3.019.331 7 3.571 7 8.509c0 3.826-3.691 8.5-8 8.5h-7.5c-3.238 0-4.5-1.262-4.5-4.5V12.783l4.078 4.07a.5.5 0 1 0 .708-.706l-4.461-4.452c-.594-.592-1.055-.592-1.648 0l-4.461 4.452a.5.5 0 0 0 .707.707L20 12.783V26.5c0 3.804 1.696 5.5 5.5 5.5H33c4.847 0 9-5.224 9-9.5c0-5.167-4.223-9.208-8.042-9.512"/></svg>
                    </div>
                    <div style={{ display: "none" }}>
                        <input type="file" name="file" ref={onInputRef} onChange={handleFileChange} required />
                        <input type="text" name="dest" value={appContext.appState().directory!.path} style={{ display: "none" }}/>
                    </div>
                    <div class="upload-label">{fileName() ?? "Drag and Drop or click below to choose" }</div>
                    <Show when={uploadContext.uploadState().loading} fallback={<button type="submit" class={ fileName() ? "upload-button" : "upload-button-disabled" } disabled={fileName()=== undefined}>Upload</button>}>
                        <div class="progress-container">
                            <div class="progress-bar" style={`width: ${uploadContext.uploadState().progress}%`}></div>
                        </div>
                        <p class="progress-text">{uploadContext.uploadState().progress}% complete - {uploadContext.uploadState().status}</p>
                    </Show>
                    <Show when={uploadContext.uploadState().error}>
                        <p class="progress-text">{uploadContext.uploadState().status}</p>
                        <p class="progress-text">{uploadContext.uploadState().error}</p>
                    </Show>
                </form>
                <div style={{ flex: 1, display: "flex", "flex-direction": "column", width: "100%" }}>
                    <div class="panel-title" style={{ display: "flex", "flex-direction": "row", "align-items": "center", gap: "8px" }}>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4.5 11.5a3 3 0 0 1 3-3h8.718a4 4 0 0 1 2.325.745l4.914 3.51a4 4 0 0 0 2.325.745H40.5a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-33a3 3 0 0 1-3-3z" stroke-width="1"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 33.5v-14m6.167 6.167L24 19.5l-6.167 6.167" stroke-width="1"/></svg>
                        </span>
                        <span>Uploads</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", "flex-direction": "column", "align-items": "center","justify-content": "center", "padding-left": "2rem", "padding-right": "2rem" }}>
                        <Show when={ uploadContext.uploadState().uploads.length > 0 } fallback={<p>No uploads have been made</p>}>
                            <div style={{ width: "100%", height: "100%", "overflow-y": "auto", "padding-top": "0.8rem", "padding-bottom": "0.8rem", display: "flex", "flex-direction": "column", gap: "0.8rem" }}>
                                <For each={ uploadContext.uploadState().uploads }>
                                    {(item)=> <FileInfoView file={item}/>}
                                </For>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </Motion.div>
    );
}

export default Upload;