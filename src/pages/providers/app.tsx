import { createContext, createEffect, createMemo, createSignal, onMount, Show, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails, DirectoryFile } from "../../repositories/files_repository";
import type { CopyProgressEvent, DeletePregressEvent } from "../../utils/file-handle_bridge";
import { ContextMenuProvider } from "./context-menu";
import DeleteFile from "../popups/delefie-file";
import FileCopying from "../popups/file-copying";
import useWS from "../../utils/ws-hook";
import { request } from "../../utils/util";

type ClipbordCommand = "copy" | "move";

type Clipboard = {
    file: DirectoryFile;
    command: ClipbordCommand
}

type AppContextType = {
    loading: boolean;
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
export interface ProgressReport<T>{
    progress?: T,
    errorMessage?: string
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AppContextType>({ loading: false, target: "directory" });
    const [popUpState, setPopUpState] = createSignal<PopUpState>({ action: "None" });
    const [copyProgress, setCopyProgress] = createSignal<ProgressReport<CopyProgressEvent>>();
    const [deleteProgress, setDeleteProgress] = createSignal<ProgressReport<DeletePregressEvent>>();
    const { setMessageListener, send } = useWS('/api/process');

    const closePopup = () =>{
        setPopUpState({ action: "None" });
    }

    const clearReports = () =>{
        setCopyProgress();
        setDeleteProgress();
    }

    // fetching initial directory details from api based on the url path on load
    const fetchDirectory = async (path?: string) => {
        const currentPath = path ?? localStorage.getItem('path') ?? "/";
        setState(init => { return { ...init, loading: true, error: undefined, target: "directory" } });

        try{
            const result = await request({ url: `/api${currentPath}` });
            if(result.isFirst){
                const response = result.first;
                const directory = response.data as DirectoryDetails;
                setState(init => {
                    return { ...init, loading: false, directory, error: undefined } });
            }else{
                const response = result.second;
                console.error("Error fetching initial directory:", response.error);
                setState(init => { return { ...init, loading: false, directory: undefined, error: response.error.message } });
            }
        }catch(error){
            console.error("Error fetching initial directory:", error);
            setState(init => { return { ...init, loading: false, directory: undefined, error: "Failed to load directory details" } });
        }
    }

    const deleteFile = async (file: string) => {
        const currentPath = state().directory?.path;
        setState(init => { return { ...init, loading: true, error: undefined } });

        send("delete", { path: currentPath, file });
    }

    const paste = async (destFile?: DirectoryFile) => {
        const dest = destFile?.path ?? state().directory!.path;
        const file = state().clipboard!.file;

        if(state().clipboard?.command === "copy"){
            send("copy", { filePath: file.path, destination: dest });
            setPopUpState({ file: file.name, destination: dest, action: "File_Copying" });
        }else{
            setState(init => { return { ...init, loading: true, error: undefined } });

            try{
                const result = await request({ url: `/api/${ state().clipboard?.command}`, method: "PATCH", input: { filePath: file.path, dest } });
                if(result.isFirst){
                    fetchDirectory();
                }else{
                    const response = result.second;
                    console.error(response.error);
                    alert(response.error.message);
                }

                if(state().clipboard?.command === 'move'){
                    setState(init => { return { ...init, clipboard: undefined } });
                }
            }catch(error){
                setState(init => { return { ...init, loading: false, error } });
                console.error(`Error pasting file ${file}:`, error);
                alert(`Failed to ${ state().clipboard?.command } ${file.name}`);
            }
        }
    }

    onMount(()=> {
        fetchDirectory();

        setMessageListener((message)=>{
            console.log('Received message from server:', message);
            if(message.completed){
                fetchDirectory().then(closePopup).finally(clearReports);
            }else{
                switch(message.operation){
                    case "delete":
                        if(message.status === 200){
                            const progress = message.progress as DeletePregressEvent;
                            setDeleteProgress({ progress });
                        }else{
                            setDeleteProgress(init => { return { ...init, errorMessage: message.message } });
                        }
                        break
                    case "copy":
                        if(message.status === 200 && message.progress){
                            const progress = message.progress as CopyProgressEvent;
                            setCopyProgress({ progress });  
                        }else{
                            setCopyProgress(init => { return { ...init, errorMessage: message.message } });
                        }
                        break;
                }
            }
        });
    });

    const providerValue: AppContextProviderType = {
        appState: () => {
            return {...state() }
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