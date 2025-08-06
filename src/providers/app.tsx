import { createContext, createSignal, on, onMount, useContext, type Component, type JSXElement, type ParentComponent } from "solid-js";
import type { DirectoryDetails } from "../utils/files_repository";

type AppContextType = {
    loading: boolean;
    directory?: DirectoryDetails
    error?: string;
}

export interface AppContextProviderType extends AppContextType {
    isError: boolean;

    goto(path: string): void;
    reload(): void;
}

const AppContext = createContext<AppContextProviderType>();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        console.log(JSON.stringify(context));
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
}

const AppContextProvider: ParentComponent = ({ children }) =>{
    const [state, setState] = createSignal<AppContextType>({ loading: true });

    // fetching initial directory details from api based on the url path on load
    const fetchInitialDirectory = async (path?: string) => {
        setState({ loading: true });
        const currentPath = path ?? window.location.pathname.replace("/files", "").replace("/streaming", "");

        try {
            const response = await fetch(`/api${currentPath}`);
            if (!response.ok) {
                throw new Error("Failed to fetch directory details");
            }
            const directory = await response.json();
            setState({ loading: false, directory });
        } catch (error) {
            console.error("Error fetching initial directory:", error);
            setState({ loading: false, error: "Failed to load directory details" });
        }
    }

    onMount(() => {
        fetchInitialDirectory(); 
    });

    const goto = (path: string) => {
        fetchInitialDirectory(path).finally(()=>{
            window.location.pathname = path;
        });
    }

    const reload = () => fetchInitialDirectory();

    return (
        <AppContext.Provider value={{ ...state(), goto, reload, isError: !!state().error }}>
            {children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;