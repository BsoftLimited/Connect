import { createContext, createEffect, createMemo, createSignal, onMount, Show, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails, DirectoryFile } from "../../repositories/files_repository";
import type { CopyProgressEvent, DeletePregressEvent } from "../../utils/file-handle_bridge";
import { ContextMenuProvider } from "./context-menu";
import DeleteFile from "../popups/delefie-file";
import FileCopying from "../popups/file-copying";

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

type PopUpState = {
    action: "None" | "Delete_File" | "File_Copying",
    file?: string
    destination?: string
}

export type SocketMessage = { message: string, operation: string, progress?: any, completed?: boolean, status: number }
export interface ProgressReport<T>{
    progress?: T,
    errorMessage?: string
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<Omit<AppContextType, "connected">>({ loading: false, target: "directory" });
    const [ws, setWS] = createSignal<WebSocket>();
    const [popUpState, setPopUpState] = createSignal<PopUpState>({ action: "None" });
    const [copyProgress, setCopyProgress] = createSignal<ProgressReport<CopyProgressEvent>>();
    const [deleteProgress, setDeleteProgress] = createSignal<ProgressReport<DeletePregressEvent>>();

    const closePopup = () =>{
        setPopUpState({ action: "None" });
    }

    const clearReports = () =>{
        setCopyProgress();
        setDeleteProgress();
    }

    const connect = () =>{
        if(ws() === undefined || !ws()?.OPEN){
            // Connect to WebSocket
            const init = new WebSocket('/api/process')

            init.onopen = () => {
                console.log('Connected to server')
                setWS(init);
            }

            init.onmessage = (event) => {
                console.log('Received from server:', event.data);

                const message = JSON.parse(event.data) as SocketMessage;
                if(message.completed){
                    fetchDirectory().then(closePopup).finally(clearReports);
                }else{
                    switch(message.operation){
                        case "delete":
                            if(message.status === 200){
                                const progress = message.progress as DeletePregressEvent;
                                setDeleteProgress({ progress, errorMessage: undefined });
                            }else{
                                setDeleteProgress(init => { return { ...init, errorMessage: message.message } });
                            }
                            break
                        case "copy":
                            if(message.status === 200 && message.progress){
                                const progress = message.progress as CopyProgressEvent;
                                setCopyProgress({ progress, errorMessage: undefined });  
                            }else{
                                setCopyProgress(init => { return { ...init, errorMessage: message.message } });
                            }
                            break;
                    }
                }
            }

            init.onclose = () => {
                console.log('Connection closed');
                setWS();
            }
            init.onerror = (event) => console.error(event);
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

        connect()?.send(JSON.stringify({ operation: "delete",
            data: { path: currentPath, file }
        }));
    }

    const paste = async (destFile?: DirectoryFile) => {
        const dest = destFile?.path ?? state().directory!.path;
        const file = state().clipboard!.file;

        if(state().clipboard?.command === "copy"){
            connect()?.send(JSON.stringify({ operation: "copy", 
                data: { filePath: file.path, destination: dest }
            }));
            setPopUpState({ file: file.name, destination: dest, action: "File_Copying" });
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
        deleteFile: async (file: string) =>{
            setPopUpState({ action: "Delete_File", file });
        },
        stream: (file)=> setState(init => { return { ...init, file, target: "stream" } }),
        closeStream: () => setState(init => { return { ...init, target: "directory" } }),
        saveClipboard: (clipboard) => setState(init => { return { ...init, clipboard } }),
        paste
    };

    return (
        <AppContext.Provider value={providerValue}>
            {props.children}
            <Show when={popUpState().action === "Delete_File"}>
                <DeleteFile file={popUpState().file!} cancel={closePopup} procced={deleteFile} progressReport={deleteProgress()} />
            </Show>
            <Show when={popUpState().action === "File_Copying"}>
                <FileCopying file={popUpState().file!} progressReport={copyProgress()!} destination={popUpState().destination!}/>
            </Show>
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        console.log(JSON.stringify(context));
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
}

export const AppProvider: ParentComponent = (props) => {
    return (
        <ContextMenuProvider>
            <AppContextProvider>
                {props.children}
            </AppContextProvider>
        </ContextMenuProvider>
    );
}