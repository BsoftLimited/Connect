import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { CreateUser, User } from "../../common";
import { UserProvider, useUserContext } from "./user";
import { request, type RequestFailed } from "../../utils/util";

export type AccountsPages = "profile" | "users" | "settings"
export type AccountsPanels = "Edit Profile" | "Change Password" | "Create User" | "Edit User" | "Delete User";

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
    deleteUser: (id: string) => Promise<void>,
    updateProfile: (data: { username?: string, email?: string }) => Promise<void>,
    changePassword: (data: { oldPassword: string, newPassword: string }) => Promise<void>,
}

const AccountsStateContext = createContext<AccountsStateType>();

const AccountsStateProvider: ParentComponent = (props) =>{
    const [pageState, setPageState] = createSignal<AccountsPageState>({ currentPage: "profile", panelState: { show: false } });
    const [state, setState] = createSignal<AccountsState>({ loading: false, users: [] });
    const {sessionState} = useUserContext();

    const closePanel = () =>{
        setPageState((init)=>{
            return {...init, panelState: { show: false }}
        });
    }

    const createUser = async (data: CreateUser) =>{
        try{
            const response = await request({ url: `/api/user`, input: data, method: "POST" });
            if(response.status === 201){
                const newUser = response.data as User;
                setState(init => ({ ...init, users: [...init.users, newUser], loading: false }));
                alert("User created successfully");
                closePanel();
            }else{
                console.error(response);
            }
        }catch(error){
            const failedResponse = error as RequestFailed;
            setState(init => { return { ...init, loading: false, error: failedResponse.error } });
            console.error(`User creation failied`, failedResponse.error);
            alert(`User creation failied: ${failedResponse}`);
        }
    }

    const deleteUser = async (id: string) =>{
        try{
            const response = await fetch(`/api/users/`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            if(!response.ok){
                throw new Error("Failed to delete user");
            }

            const updatedUsers = state().users.filter(u => u.id !== id);
            setState(init => ({ ...init, users: updatedUsers, loading: false }));
            alert("User deleted successfully");
            closePanel();
        }catch(error){
            console.error("Failed to delete user", error);
            alert(`Failed to delete user: ${error}`);
            setState(init => ({ ...init, loading: false, error }));
        }
    }

    const updateProfile = async (data: { username?: string, email?: string }) =>{
        try{
            const request = new Request(`/api/user`, {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            fetchUsers();
        }catch(error){
            setState(init => { return { ...init, loading: false, error } });
            console.error(`User update failied`, error);
            alert(`Profile update failied: ${error}`);
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
        closePanel,
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
        deleteUser,
        changePassword,
        updateProfile
    };

    onMount(() => {
        if(sessionState().data?.user.role === "admin"){
            fetchUsers();
        }
    });

    return (
        <AccountsStateContext.Provider value={accountsStateType}>
            {props.children}
        </AccountsStateContext.Provider>
    );
}

export const useAccountsContext = () =>{
    const context = useContext(AccountsStateContext);
    if(!context){
        throw new Error("useAccountsContext must be used within an AccountsStateProvider");
    }
    return context;
}

export { AccountsStateProvider };