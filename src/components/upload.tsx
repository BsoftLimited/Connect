import { Motion } from "@motionone/solid";

import { useAppContext } from "../providers/app";
import { useUploadContext } from "../providers/upload";
import { type Component } from "solid-js";

interface UploadProps{
    open: boolean
}

const Upload: Component<UploadProps> = (props) =>{
    const appContext = useAppContext();
    const uploadContext = useUploadContext();

    return (
        <Motion.div initial={{ x: "100%" }} animate={{ x: props.open ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }}
            class="panel"
            style={{ display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column" }}>
            <h1 class="text-2xl font-bold mb-4">File Upload with Progress</h1>
            <form onSubmit={uploadContext.upload} class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Choose a file</label>
                    <input type="file" name="file" required class="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <input type="text" name="dest" value={appContext.state().directory!.path} style={{ display: "none" }}/>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Upload</button>
            </form>
            <div class="mt-6">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style={`width: ${uploadContext.uploadState().progress}%`}></div>
                </div>
                <p class="text-sm text-gray-600 mt-2">{uploadContext.uploadState().progress}% complete - {uploadContext.uploadState().status}</p>
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
        </Motion.div>
    );
}

export default Upload;