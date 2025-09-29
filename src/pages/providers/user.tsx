import { createContext, createEffect, createSignal, on, onMount, useContext, type ParentComponent } from "solid-js";
import type { Session, State, ThemePreference } from "../../common";
import { SystmeProvider, useSystem } from "./system";

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
    sessionState: () => State<Session>;
    logout: () => void;
    toggleTheme: () => void;
    isDark: () => boolean;
}

const UserContext = createContext<UserContextType>();
const UserContextProvider: ParentComponent = (props) => {
    const [state, setState] = createSignal<State<Session>>({ loading: true });
    const { systemState } = useSystem();

    const initializeTheme = (theme: ThemePreference) => {
        const htmlElement = document.getElementsByTagName("body")[0];
        if(htmlElement){
            htmlElement.classList.add(theme);
        }
    }

    const updateTheme = async (newTheme: ThemePreference) => {
        try{
            const response = await fetch("/api/user/theme", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ theme: newTheme })
            });
            if (!response.ok) {
                throw new Error("Failed to update theme");
            }
        }catch(error){
            console.error("Failed to update theme:", error);
        }
    }

    // funtion that runs as soons as the value of systemState changes
    createEffect(on(systemState, async(value) => {
        if(value.data && !state().data){
            try {
                const response = await fetch('/api/user');
                if (!response.ok) {
                    throw new Error("Failed to fetch user details");
                }
                const session = await response.json() as Session;
                initializeTheme(session.config.theme || "light");
                setState(init => ({ ...init, loading: false, data: session, error: undefined }));
            } catch (error) {
                console.error("Error fetching user:", error);
                setState(init => ({ ...init, loading: false, error: "Failed to load user details" }));
            }
        }
    }, { defer: true }));

    const userContextType: UserContextType = {
        sessionState: state,
        logout: async () => {
            setState(init => ({ ...init, loading: true, error: undefined }));
            try {
                const response = await fetch('/auth/logout', { method: 'GET' });
                if (!response.ok) {
                    throw new Error("Failed to log out");
                }
                window.location.reload();
            } catch (error) {
                console.error("Error logging out:", error);
                setState(init => ({ ...init, loading: false, error: "Failed to log out" }));
                alert("Failed to log out. Please try again.");
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