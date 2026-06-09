import { createContext, createSignal, onMount, Show, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails, DirectoryFile } from "../../repositories/files_repository";
import type { CopyProgressEvent, DeletePregressEvent } from "../../utils/file-handle_bridge";
import { ContextMenuProvider } from "./context-menu";
import DeleteFile from "../popups/delefie-file";
import FileCopying from "../popups/file-copying";
import useWS from "../../utils/ws-hook";
import { request } from "../../utils/util";
import usePageHook, { type PageState } from "../../utils/page-hook";
import CreateFolder from "../popups/create-folder";

type ClipbordCommand = "copy" | "move";

type Clipboard = {
    file: DirectoryFile;
    command: ClipbordCommand
}

export type AppPanels = "Notifications" | "Upload File" | "Playlist";
export type AppPages = "Directory" | "Streaming";


type AppContextType = {
    loading: boolean;
    directory?: DirectoryDetails;
    error?: any;
    clipboard?: Clipboard;
}

interface AppContextProviderType {
    goto: (path: string)=> void;
    stream: (file: string) => void;
    deleteFile: (file: string) => void;
    deleteSelf: () => void;
    reload: ()=> void;
    appState: ()=> AppContextType;
    closeStream: () => void;
    saveClipboard: (clipboard: Clipboard) => void;
    paste : (file?: DirectoryFile) => void;
    create: () => void;

    closePanel: () => void,
    openPanel: (panel: AppPanels) => void,
    pageState: () => PageState<AppPages, AppPanels>,
}

type PopUpState = {
    action: "None" | "Delete File" | "File Copying" | "Create Folder",
    file?: string
    destination?: string
}
export interface ProgressReport<T>{
    progress?: T,
    errorMessage?: string
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AppContextType>({ loading: false });
    const [popUpState, setPopUpState] = createSignal<PopUpState>({ action: "None" });
    const [copyProgress, setCopyProgress] = createSignal<ProgressReport<CopyProgressEvent>>();
    const [deleteProgress, setDeleteProgress] = createSignal<ProgressReport<DeletePregressEvent>>();
    const { setMessageListener, send } = useWS('/api/process');

    const page = usePageHook<AppPages, AppPanels>("Directory");

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

    const deleteFile = async (file?: string) => {
        if(file){
            const currentPath = state().directory?.path;
            send("delete", { path: currentPath, file });
        }else{
            const currentPath = state().directory?.path;
            if(currentPath && currentPath !== "/"){
                const pathSegments = currentPath.split("/").filter(segment => segment.length > 0);
                const fileName = pathSegments.pop()!;
                const parentPath = "/" + pathSegments.join("/");
                send("delete", { path: parentPath, file: fileName });
            }
        }
    }

    const paste = async (destFile?: DirectoryFile) => {
        const dest = destFile?.path ?? state().directory!.path;
        const file = state().clipboard!.file;

        if(state().clipboard?.command === "copy"){
            send("copy", { filePath: file.path, destination: dest });
            setPopUpState({ file: file.name, destination: dest, action: "File Copying" });
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
                if(message.operation === "delete" && popUpState().action === "Delete File" && !popUpState().file){
                    const currentPath = state().directory?.path;
                    const pathSegments = currentPath?.split("/").filter(segment => segment.length > 0)!;
                    pathSegments.pop();
                    const parentPath = "/" + pathSegments.join("/");
                    fetchDirectory(parentPath).finally(()=>{
                        localStorage.setItem('path', parentPath);
                    }).then(closePopup).finally(clearReports);
                }else{
                    fetchDirectory().then(closePopup).finally(clearReports);
                }
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
        ...page,
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
            setPopUpState({ action: "Delete File", file });
        },
        deleteSelf: async () =>{
            setPopUpState({ action: "Delete File" });
        },
        stream: (file)=> page.choosePage("Streaming", file),
        closeStream: () => page.choosePage("Directory"),
        saveClipboard: (clipboard) => setState(init => { return { ...init, clipboard } }),
        create: () => {
            setPopUpState({  action: "Create Folder"});
        },
        paste
    };

    return (
        <AppContext.Provider value={providerValue}>
            {props.children}
            <Show when={popUpState().action === "Delete File"}>
                <DeleteFile file={popUpState().file} cancel={closePopup} procced={deleteFile} progressReport={deleteProgress()} />
            </Show>
            <Show when={popUpState().action === "File Copying"}>
                <FileCopying file={popUpState().file!} progressReport={copyProgress()!} destination={popUpState().destination!}/>
            </Show>
            <Show when={popUpState().action === "Create Folder"}>
                <CreateFolder done={() => { closePopup(); fetchDirectory(); }} cancel={closePopup}/>
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