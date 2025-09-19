import { createContext, createSignal, on, onMount, useContext, type ParentComponent } from "solid-js";
import type { User } from "../../common/user";

interface UserState{
    loading: boolean;
    user?: User;
    error?: any;
}

interface UserContextType{
    userState: () => UserState
    logout: () => void;
}

const UserContext = createContext<UserContextType>();
const UserContextProvider: ParentComponent = (props) => {
    const [state, setState] = createSignal<UserState>({ loading: false });

    const fetchUser = async () => {
        setState(init => ({ ...init, loading: true, error: undefined }));
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error("Failed to fetch user details");
            }
            const user = await response.json() as User;
            setState(init => ({ ...init, loading: false, user }));
        } catch (error) {
            console.error("Error fetching user:", error);
            setState(init => ({ ...init, loading: false, error: "Failed to load user details" }));
        }
    };

    onMount(() => {
        if(window.location.pathname !== "/login"){
            fetchUser();
        }
    });
    
    const logout = async () => {
        setState(init => ({ ...init, loading: true, error: undefined }));
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error("Failed to log out");
            }
            window.location.reload();
        } catch (error) {
            console.error("Error logging out:", error);
            setState(init => ({ ...init, loading: false, error: "Failed to log out" }));
            alert("Failed to log out. Please try again.");
        }
    };

    return (
        <UserContext.Provider value={{ userState: state, logout}}>
            {props.children}
        </UserContext.Provider>
    );
};

const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}

export { UserContextProvider, useUserContext };