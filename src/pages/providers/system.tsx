import {createContext, useContext, type ParentComponent, onMount, createSignal} from "solid-js";
import type { SiteConfig, State } from "../../common";

interface SystemContextType {
    systemState: () => State<SiteConfig>;
}

const SystemContext = createContext<SystemContextType>();

const SystmeProvider: ParentComponent = (props) => {
    const [configState, setConfigState] = createSignal<State<SiteConfig>>({ loading: true });

    onMount(async ()=> { 
        try {
            const response = await fetch("/config");
            if (response.ok) {
                const config = await response.json() as SiteConfig;
                setConfigState({ data: config, loading: false });
            }
        } catch (error) {
            console.error("Failed to fetch site config:", error);
            setConfigState({ error: "Failed to load site configuration", loading: false } );
        }
    });
    
    const contextType: SystemContextType = {
        systemState: () => configState()
    };
    
    return (
        <SystemContext.Provider value={contextType}>
            {props.children}
        </SystemContext.Provider>
    );
};

// 4. Create custom hook for consuming context
const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export { SystmeProvider, useSystem };