import { createContext, createSignal, useContext, type ParentComponent } from "solid-js";
import type { DirectoryFile } from "../utils/files_repository";

interface ContextMenuStatus{
    x?: string, y?: string,
    show: "file" | "directory" | "none",

    file?: DirectoryFile
}

interface ContextMenuType{
    status: ()=> ContextMenuStatus,
    clear: CallableFunction,
    showFileContext: (event: PointerEvent, file: DirectoryFile) => void,
    showDirectoryContext: (event: PointerEvent) => void
}

const ContextMenuContext = createContext<ContextMenuType>();

const ContextMenuProvider: ParentComponent = ({ children }) =>{
    const [status, setStatus] = createSignal<ContextMenuStatus>({ show: "none" });

    const clear = () => {
        setStatus({ show: "none"});
        document.removeEventListener("click", clear);
    };

    const showFileContext = (event: PointerEvent, file: DirectoryFile) =>{
        event.preventDefault();
        event.stopPropagation();
        
        clear();
        setStatus({ show: "directory", x: `${event.pageX}px`, y: `${event.pageY}px`, file });
        document.addEventListener("click", clear);
    }

    const showDirectoryContext = (event: PointerEvent) =>{
        event.preventDefault();
        event.stopPropagation();

        clear();
        setStatus({ show: "directory", x: `${event.pageX}px`, y: `${event.pageY}px` });
        document.addEventListener("click", clear);
    }

    return (
        <ContextMenuContext.Provider value={{ status, showFileContext, showDirectoryContext, clear }}>
            {children}
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