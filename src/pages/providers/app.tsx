import { createContext, createEffect, createMemo, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails, DirectoryFile } from "../../repositories/files_repository";
import type { CopyProgressEvent } from "../../utils/file-handle_bridge";

type ClipbordCommand = "copy" | "move";

type Clipboard = {
    file: DirectoryFile;
    command: ClipbordCommand
}

type AppContextType = {
    loading: boolean;
    connected: boolean;
    directory?: DirectoryDetails;
    file?: string; 
    error?: any;
    target: "directory" | "stream";
    clipboard?: Clipboard;
}

interface AppContextProviderType {
    goto: (path: string)=> void;
    stream: (file: string) => void;
    deleteFile: (file: string) => void;
    reload: ()=> void;
    appState: ()=> AppContextType;
    closeStream: () => void;
    saveClipboard: (clipboard: Clipboard) => void;
    paste : (file?: DirectoryFile) => void
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<Omit<AppContextType, "connected">>({ loading: false, target: "directory" });
    const [ws, setWS] = createSignal<WebSocket>();

    const connect = () =>{
        if(ws() === undefined || ws()?.CLOSED){
            // Connect to WebSocket
            const init = new WebSocket('/api/process')

            init.onopen = () => {
                console.log('Connected to server')
                setWS(init);
            }

            init.onmessage = (event) => {
                console.log('Received from server:', event.data);

                const message = JSON.parse(event.data) as { message: string, progress?: CopyProgressEvent, completed?: boolean, status: number };
                if(message.status === 200 && message.progress){
                    
                }

                if(message.completed){
                    fetchDirectory();
                }
            }

            init.onclose = () => {
                console.log('Connection closed');
                setWS();
            }

            init.onerror = (event) =>{}
            return init;
        }
        return ws();
    }

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
        setState(init => { return { ...init, loading: true, error: undefined } });

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
            setState(init => { return { ...init, loading: false, error } });
            console.error(`Error deleting file ${file}:`, error);
            alert(`File: ${file} deletion fialed`);
        }
    }

    const parseFile = async (destFile?: DirectoryFile) => {
        const dest = destFile?.path ?? state().directory!.path;
        const file = state().clipboard!.file;

        if(state().clipboard?.command === "copy"){
            connect()?.send(JSON.stringify({ operation: "copy", filePath: file.path, destination: dest }));
        }else{
            setState(init => { return { ...init, loading: true, error: undefined } });

            try{
                const request = new Request(`/api/${ state().clipboard?.command}`, {
                    method: "PATCH",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ filePath: file.path, dest })
                });

                const response = await fetch(request);
                if (!response.ok) {
                    throw new Error(`Failed to ${ state().clipboard?.command } ${file.name}`);
                }

                if(state().clipboard?.command === 'move'){
                    setState(init => { return { ...init, clipboard: undefined } });
                }
                
                fetchDirectory();
            }catch(error){
                setState(init => { return { ...init, loading: false, error } });
                console.error(`Error pasting file ${file}:`, error);
                alert(`File: ${file} paste fialed`);
            }
        }
    }

    onMount(()=> {
        if(window.location.pathname !== "/login"){
            fetchDirectory();
        }
        connect();
    });

    const providerValue: AppContextProviderType = {
        appState: () => {
            return {...state(), connected: ws() !== null}
        },
        goto: (path) => {
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
        stream: (file)=> setState(init => { return { ...init, file, target: "stream" } }),
        closeStream: () => setState(init => { return { ...init, target: "directory" } }),
        saveClipboard: (clipboard) => setState(init => { return { ...init, clipboard } }),
        paste: (file) => {
            parseFile(file);
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