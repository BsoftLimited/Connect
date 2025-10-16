import { createContext, createEffect, createSignal, on, onMount, useContext, type ParentComponent } from "solid-js";
import type { Notification, Session, State, ThemePreference, UpdateProfileData, UserConfig } from "../../common";
import { SystmeProvider, useSystem } from "./system";
import { request } from "../../utils/util";
import useWS from "../../utils/ws-hook";

const initTheme = (): ThemePreference =>{
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){
        return savedTheme as ThemePreference;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: ThemePreference = prefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', defaultTheme);
    return defaultTheme;
}

interface UserContextType{
    sessionState: () => State<Session & { notifications: Notification[] }>;
    logout: () => void;
    toggleTheme: () => void;
    isDark: () => boolean;
    updateConfig: (config: Partial<UserConfig>) => Promise<void>
}

const UserContext = createContext<UserContextType>();
const UserContextProvider: ParentComponent = (props) => {
    const [state, setState] = createSignal<State<Session & { notifications: Notification[] }>>({ loading: true });
    const { systemState } = useSystem();
    const { setMessageListener } = useWS('/api/notifications');

    const initializeTheme = (theme: ThemePreference) => {
        const htmlElement = document.getElementsByTagName("body")[0];
        if(htmlElement){
            htmlElement.classList.add(theme);
        }
    }

    const updateTheme = async (newTheme: ThemePreference) => {
        try{
            const response = await request({ url: "/api/user/theme", method: "PATCH", input: { theme: newTheme } });
            if (!response.isFirst) {
                console.error(response.second.error);
                alert(response.second.error.message);
            }
        }catch(error){
            console.error("Failed to update theme:", error);
        }
    }

    // funtion that runs as soons as the value of systemState changes
    createEffect(on(systemState, async(value) => {
        if(value.data && !state().data){
            try {
                const result = await request({ url: '/api/user' });
                if(result.isFirst){
                    const response = result.first;
                    if(response.status === 200){
                        const session = response.data as Session & { notifications: Notification[] };
                        initializeTheme(session.config.theme || "light");
                        setState(init => ({ ...init, loading: false, data: session, error: undefined }));
                    }
                }else{
                    const response = result.second;
                    setState(init => ({ ...init, loading: false, error: response.error.message }));
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setState(init => ({ ...init, loading: false, error: "Failed to load user details" }));
            }

            setMessageListener((message)=>{
                setState((init)=>{
                    const data = { 
                        ...init.data!, 
                        notifications: [ message.notification!, ...init.data!.notifications ]
                    };
                    return {...init, data}
                })
            });
        }
    }, { defer: true }));

    const userContextType: UserContextType = {
        sessionState: state,
        logout: async () => {
            setState(init => ({ ...init, loading: true, error: undefined }));
            try {
                const result = await request({ url: '/auth/logout',  method: 'GET' });
                if(result.isFirst){
                    window.location.reload();
                }else{
                    const response = result.second;
                    setState(init => ({ ...init, loading: false, error: response.error.message }));
                }
            } catch (error) {
                console.error("Error logging out:", error);
                setState(init => ({ ...init, loading: false, error: "Failed to log out" }));
                alert("Failed to log out");
            }
        },
        toggleTheme: () => {
            const htmlElement = document.getElementsByTagName("body")[0];
            if(htmlElement){
                if (htmlElement.classList.contains("dark")) {
                    htmlElement.classList.replace('dark', 'light');
                    updateTheme("light");
                } else {
                    htmlElement.classList.replace('light', 'dark');
                    updateTheme("dark");
                }
            }
        },
        isDark: () => {
            const htmlElement = document.getElementsByTagName("body")[0]

            return htmlElement!.classList.contains("dark");
        },
        updateConfig:  async (config: Partial<UserConfig>) => {
            try{
                const result = await request({ url: "/api/user/config", method: "PATCH", input: config });
                if(result.isFirst){
                    const init = result.first;
                    if(init.status === 200){
                        const config = init.data as UserConfig;
                        const session = { ...state().data!, config }

                        setState(init =>{
                            return { ...init, data: session }
                        });
                    }
                }else{
                    const response = result.second;
                    alert(response.error.message);
                }
            }catch(error){
                console.error(error);
                alert("unable to update site configurations");
            }
        }
    };

    return (
        <UserContext.Provider value={userContextType}>
            {props.children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}

export const UserProvider: ParentComponent = (props) => {
    return (
        <SystmeProvider>
            <UserContextProvider>
                {props.children}
            </UserContextProvider>
        </SystmeProvider>
    );
}