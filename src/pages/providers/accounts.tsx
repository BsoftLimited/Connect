import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { CreateUser, User } from "../../common/user";
import { useUserContext } from "./user";

export type AccountsPages = "profile" | "users" | "settings"
export type AccountsPanels = "Edit Profile" | "Change Password" | "Create User";

export type AccountsPanelsState = {
    show: boolean,
    panel?: AccountsPanels
}

type AccountsPageState = {
    currentPage: AccountsPages,
    panelState: AccountsPanelsState,
}

type AccountsState = {
    loading: boolean;
    users: User[];
    error?: any;
}

type AccountsStateType = {
    state: () => AccountsState,
    pageState: () => AccountsPageState,
    closePanel: () => void,
    openPanel: (panel: AccountsPanels) => void,
    choosePage: (page: AccountsPages) => void,
    createUser: (data: CreateUser) => Promise<void>,
    changePassword: (data: { oldPassword: string, newPassword: string }) => Promise<void>,
}

const AccountsStateContext = createContext<AccountsStateType>();

const AccountsStateProvider: ParentComponent = (props) =>{
    const [pageState, setPageState] = createSignal<AccountsPageState>({ currentPage: "profile", panelState: { show: false } });
    const [state, setState] = createSignal<AccountsState>({ loading: false, users: [] });
    const {userState} = useUserContext();

    const createUser = async (data: CreateUser) =>{
        try{
            setState(init => ({ ...init, loading: true, error: undefined }));
            const request = new Request(`/api/user`, {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error("Failed to create user");
            }
            fetchUsers();
            setState(init => ({ ...init, loading: false }));
        }catch(error){
            setState(init => { return { ...init, loading: false, error } });
            console.error(`User creation failied`, error);
            alert(`User creation failied: ${error}`);
        }
    }

    const changePassword = async (data: { oldPassword: string, newPassword: string }) =>{
        try{

            const request = new Request(`/api/user/password`, {
                method: "PATCH",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error("Failed to change password");
            }
            setState(init => ({ ...init, loading: false }));
            alert("Password change successful. Please login again.");
        }catch(error){
            console.error(`Password change failied`, error);
            alert(`Password change failied: ${error}`);
        }
    }

    const fetchUsers = async () => {
        setState(init => ({ ...init, loading: true, error: undefined }));
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error("Failed fetching users");
            }
            const users = await response.json() as User[];
            setState(init => ({ ...init, loading: false, users }));
        } catch (error) {
            console.error("Error fetching user:", error);
            setState(init => ({ ...init, loading: false, error: "Failed to load users" }));
        }
    };

    const accountsStateType: AccountsStateType = {
        state,
        closePanel: () =>{
            setPageState((init)=>{
                return {...init, panelState: { show: false }}
            });
        },
        openPanel: (panel: AccountsPanels) => {
            setPageState((init)=>{
                return {...init, panelState: { show: true, panel } }
            });
        },
        choosePage: (page) => {
            setPageState((init)=>{
                return {...init, currentPage: page }
            });
        },
        pageState,
        createUser,
        changePassword
    };

    onMount(() => {
        if(userState().user?.role === "admin"){
            fetchUsers();
        }
    });

    return (
        <AccountsStateContext.Provider value={accountsStateType}>
            {props.children}
        </AccountsStateContext.Provider>
    );
}

const useAccountsContext = () =>{
    const context = useContext(AccountsStateContext);
    if(!context){
        throw new Error("useAccountsContext must be used within an AccountsStateProvider");
    }
    return context;
}

export { AccountsStateProvider, useAccountsContext };