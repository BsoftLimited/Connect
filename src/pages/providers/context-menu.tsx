import { createContext, createSignal, useContext, type ParentComponent } from "solid-js";
import type { DirectoryFile } from "../../utils/files_repository";

type ContextMenuStatus = {
    x?: string, y?: string,
    show: "file" | "directory" | "none",

    file?: DirectoryFile
}

type ContextMenuType = {
    status: () => ContextMenuStatus,
    clear: () => void,
    showFileContext: (event: PointerEvent, file: DirectoryFile) => void,
    showDirectoryContext: (event: PointerEvent) => void
}

const ContextMenuContext = createContext<ContextMenuType>();

const ContextMenuProvider: ParentComponent = (props) =>{
    const [status, setStatus] = createSignal<ContextMenuStatus>({ show: "none" });

    const clear = () => {
        setStatus({ show: "none"});
        document.removeEventListener("click", clear);
    }

    const contextMenuType: ContextMenuType = {
        status,
        clear,
        showFileContext: (event: PointerEvent, file: DirectoryFile) =>{
            event.preventDefault();
            event.stopPropagation();
            
            clear();
            setStatus({ show: "file", x: `${event.pageX}px`, y: `${event.pageY}px`, file });
            document.addEventListener("click", clear);
        },
        showDirectoryContext:(event: PointerEvent) =>{
            event.preventDefault();
            event.stopPropagation();

            clear();
            setStatus({ show: "directory", x: `${event.pageX}px`, y: `${event.pageY}px` });
            document.addEventListener("click", clear);
        }
    };

    return (
        <ContextMenuContext.Provider value={contextMenuType}>
            {props.children}
        </ContextMenuContext.Provider>
    );
}

const useContextMenuContext = () =>{
    const context = useContext(ContextMenuContext);
    if(!context){
        throw new Error("useContextMenuContext must be used within an ContextMenuProvider");
    }
    return context;
}

export { ContextMenuProvider, useContextMenuContext };