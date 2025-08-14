import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { DirectoryDetails } from "../utils/files_repository";

type AppContextType = {
    loading: boolean;
    directory?: DirectoryDetails
    error?: string;
}

interface AppContextProviderType {
    goto: (path: string)=> void;
    reload: ()=> void;
    state: ()=> AppContextType
}

const AppContext = createContext<AppContextProviderType>();

const AppContextProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AppContextType>({ loading: false });

    // fetching initial directory details from api based on the url path on load
    const fetchDirectory = async (path?: string) => {
        const currentPath = path ?? localStorage.getItem('path') ?? "/";
        setState(init => { return { ...init, loading: true, error: undefined } });

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
        reload: () => fetchDirectory()
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