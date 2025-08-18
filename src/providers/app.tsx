import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails } from "../utils/files_repository";

type AppContextType = {
    loading: boolean;
    directory?: DirectoryDetails;
    file?: string; 
    error?: string;
    target: "directory" | "stream";
    clipboard?: { path:string, fileType: "dir" | "file" }
}

interface AppContextProviderType {
    goto: (path: string)=> void;
    stream: (file: string) => void;
    deleteFile: (file: string) => void;
    reload: ()=> void;
    state: ()=> AppContextType;
    closeStream: () => void;
    saveToClipboard: (path:string, fileType: "dir" | "file") => void;
    paste : () => void
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AppContextType>({ loading: false, target: "directory" });

    // fetching initial directory details from api based on the url path on load
    const fetchDirectory = async (path?: string) => {
        const currentPath = path ?? localStorage.getItem('path') ?? "/";
        setState(init => { return { ...init, loading: true, error: undefined, target: "directory" } });

        try{
            const response = await fetch(`/api${currentPath}`);
            if (!response.ok) {
                throw new Error("Failed to fetch directory details");
            }
            
            const directory = await response.json() as DirectoryDetails;
            setState(init => {
                return { ...init, loading: false, directory, error: undefined } });
        }catch(error){
            console.error("Error fetching initial directory:", error);
            setState(init => { return { ...init, loading: false, directory: undefined, error: "Failed to load directory details" } });
        }
    }

    const deleteFile = async (file: string) => {
        const currentPath = state().directory?.path;

        try{
            const request = new Request(`/api`, {
                method: "DELETE",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ file, directory: currentPath })
            });

            const response = await fetch(request);
            if (!response.ok) {
                throw new Error("Failed to delete file");
            }
            
            fetchDirectory();
        }catch(error){
            console.error(`Error deleting file ${file}:`, error);
            alert(`File: ${file} deletion fialed`);
        }
    }

    const parseFile = async () => {

    }

    const parseFolder = async () => {

    }

    onMount(()=> fetchDirectory());

    const providerValue: AppContextProviderType = {
        state,
        goto: (path: string) => {
            path = path.replaceAll("\\", "/");
            console.log(path);
            fetchDirectory(path).finally(()=>{
                localStorage.setItem('path', path);
            });
        },
        reload: () => fetchDirectory(),
        deleteFile: (file) => {
            deleteFile(file);
        },
        stream: (file: string)=> setState(init => { return { ...init, file, target: "stream" } }),
        closeStream: () => setState(init => { return { ...init, target: "directory" } }),
        saveToClipboard: (path, fileType) => setState(init => { return { ...init, clipboard: { path, fileType } } }),
        paste: () => {
            if(state().clipboard?.fileType === "dir"){
                parseFolder();
            }else{
                parseFile();
            }
        }
    };

    return (
        <AppContext.Provider value={providerValue}>
            {props.children}
        </AppContext.Provider>
    );
}

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        console.log(JSON.stringify(context));
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
}

export { AppContextProvider, useAppContext }