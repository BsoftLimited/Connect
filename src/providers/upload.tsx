import { createContext, createSignal, useContext, type ParentComponent, JSX } from "solid-js";
import { useAppContext } from "./app";

interface FileInfo{
    filename: string,
    size: number,
    path: string
}

interface UploadContextState{
    loading: boolean,
    progress: number,
    status: string,
    file?: FileInfo
}

interface UploadContextType{
    upload: JSX.EventHandler<HTMLFormElement, SubmitEvent>,
    uploadState: () => UploadContextState
}

const UploadContext = createContext<UploadContextType>();

const UploadContextProvider: ParentComponent = ({ children }) =>{
    const appContext = useAppContext();
    const [state, setState] = createSignal<UploadContextState>({ loading: false, progress: 0, status: "" });

    const upload: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
        event.preventDefault();
        
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const file = formData.get('file') as File;
    
        if (!file){
            return;
        }

        formData.set("dest", appContext.state().directory!.path);
    
        setState({ status: 'Uploading...', loading: true, progress: 0 });
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
    
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setState(init => { return { ...init, progress: percentComplete } });
            }
        });
    
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                setState(init => { return { ...init, status: 'Upload complete!',  file: response } });
            } else {
                setState(init => { return { ...init, status: `Error: ${xhr.responseText}`, progress: 0 } });
            }
        });
    
        xhr.addEventListener('error', () => setState(init => { return { ...init, status: 'Upload failed', progress: 0 } }));
    
        xhr.send(formData);
    };

    return (
        <UploadContext.Provider value={{ uploadState: state, upload  }}>
            { children }
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