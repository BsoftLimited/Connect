import { createContext, createSignal, useContext, type ParentComponent, JSX } from "solid-js";
import { useAppContext } from "./app";

interface FileInfo{
    filename: string,
    size: number,
    dest: string
}

interface UploadContextState{
    loading: boolean,
    progress: number,
    status: string,
    error?: string,
    uploads: FileInfo[]
}

interface UploadContextType{
    upload: JSX.EventHandler<HTMLFormElement, SubmitEvent>,
    uploadState: () => UploadContextState
}

const UploadContext = createContext<UploadContextType>();

const UploadContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<UploadContextState>({ loading: false, progress: 0, status: "", uploads: [] });
    const appContext = useAppContext();

    const upload: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
        event.preventDefault();
        
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        if (!formData.has("file") || !formData.has("dest")){
            return;
        }
    
        setState(init => { return { ...init, status: 'Uploading...', error: undefined, loading: true, progress: 0 } });
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
    
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setState(init => { return { ...init, progress: percentComplete } });
            }
        });
    
        xhr.addEventListener('load', () => {
            console.log(xhr.response);
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                console.log(response);
                
                const uploads = [...state().uploads];
                uploads.push(response);
                setState(init => { return { ...init, status: 'Upload complete!', uploads, loading: false } });
                appContext.reload();
            } else {
                setState(init => { return { ...init, status: 'Upload failed', error: `Error: ${xhr.responseText}`, progress: 0 } });
            }
        });
    
        xhr.addEventListener('error', (error) => setState(init => { return { ...init, status: 'Upload failed', error: `Upload failed: ${error}`, progress: 0 } }));
        xhr.send(formData);
    };

    return (
        <UploadContext.Provider value={{ uploadState: state, upload  }}>
            { props.children }
        </UploadContext.Provider>
    );
}

const useUploadContext = () =>{
    const context = useContext(UploadContext);
    if(!context){
        throw new Error("useUploadContext must be used within an UploadContextProvider");
    }
    return context;
}

export { type FileInfo, type UploadContextType, UploadContextProvider, useUploadContext};