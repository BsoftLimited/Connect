import {createContext, useContext, type ParentComponent, onMount, createSignal} from "solid-js";
import type { SiteConfig, SiteConfigUpdate, State } from "../../common";
import { request } from "../../utils/util";

interface SystemContextType {
    systemState: () => State<SiteConfig>,
    updateConfig: (config: Partial<SiteConfigUpdate>) => Promise<void>
}

const SystemContext = createContext<SystemContextType>();

const SystmeProvider: ParentComponent = (props) => {
    const [configState, setConfigState] = createSignal<State<SiteConfig>>({ loading: true });

    onMount(async ()=> { 
        try {
            const result = await request({ url: "/config" });
            if (result.isFirst) {
                const response = result.first;
                const config = response.data as SiteConfig;
                setConfigState({ data: config, loading: false });
            }else{
                const response = result.second;
                console.error(response.error);
                setConfigState({ error: response.error.message, loading: false } );
            }
        } catch (error) {
            console.error("Failed to fetch site config:", error);
            setConfigState({ error: "Failed to load site configuration", loading: false } );
        }
    });
    
    const contextType: SystemContextType = {
        systemState: () => configState(),
        updateConfig:  async (config: Partial<SiteConfigUpdate>) => {
            try{
                const result = await request({ url: "/config", method: "PATCH", input: config });
                if(result.isFirst){
                    const response = result.first;
                    if(response.status === 200){
                        const config = response.data as SiteConfig;
                    
                        setConfigState(init =>{
                            return { ...init, data: config }
                        });
                    }
                }else{
                    const response = result.second;
                    console.error(response.error);
                    alert(response.error.message);
                }
            }catch(error){
                console.error(error);
                alert("unable to update site configurations");
            }
        }
    };
    
    return (
        <SystemContext.Provider value={contextType}>
            {props.children}
        </SystemContext.Provider>
    );
};

const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) throw new Error("useSystem must be used within SystemProvider");
    return context;
};

export { SystmeProvider, useSystem };