import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { CreateUserData, EditUserFailed, EditUserFormData, UpdateProfileData, UpdateProfileFailed, User } from "../../common";
import { useUserContext } from "./user";
import { request, type RequestFailed } from "../../utils/util";

export type AccountsPages = "profile" | "users" | "settings"
export type AccountsPanels = "Edit Profile" | "Change Password" | "Create User" | "User Details" | "Delete User";

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

export type CreateUserFailedResult = {message?: string, error?: Partial<CreateUserData>};
type AccountsStateType = {
    state: () => AccountsState,
    pageState: () => AccountsPageState,
    closePanel: () => void,
    openPanel: (panel: AccountsPanels) => void,
    choosePage: (page: AccountsPages) => void,
    createUser: (data: CreateUserData) => Promise<CreateUserFailedResult>,
    deleteUser: (id: string) => Promise<void>,
    updateProfile: (data: UpdateProfileData) => Promise<UpdateProfileFailed>,
    updateUser: (data: EditUserFormData) => Promise<EditUserFailed>
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

    const createUser = async (data: CreateUserData): Promise<CreateUserFailedResult> =>{
        let init: CreateUserFailedResult = {};
        try{
            const response = await request({ url: `/api/user`, input: data, method: "POST" });
            if(response.status === 201){
                const newUser = response.data as User;
                setState(init => ({ ...init, users: [...init.users, newUser] }));
                alert("User created successfully");
                closePanel();
            }
        }catch(error){
            const failedResponse = error as RequestFailed;
            console.error(`User creation failied`, failedResponse.error);
            alert(`User creation failied: ${failedResponse}`);

            if(failedResponse.status === 401){
                init = ({ message: failedResponse.error.message, error: failedResponse.error.error });
            }else{
                console.error(failedResponse);
                init = { message: "An error occurred. Please try again." };
            }
        }
        return init;
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
        updateProfile: async (data: UpdateProfileData) =>{
            let init: UpdateProfileFailed = {};

            try{
                const response = await request({ url: `/api/user`, method: "PATCH", input: data });
                if (response.status === 200) {
                    fetchUsers().finally(()=>{
                        closePanel()
                    });
                }
            }catch(error){
                console.log(error);
                const response = error as RequestFailed;
                init = response.error;
            }
            return init;
        },
        updateUser: async (data: EditUserFormData): Promise<EditUserFailed> =>{
            let init: EditUserFailed = {};

            request({ url: `/api/user/access`, input: data, method: "PATCH" }).then((response)=>{
                if(response.status === 200){
                    alert("User update successfully");
                    fetchUsers().finally(()=>{
                        closePanel();
                    });
                }
            }).catch((error)=>{
                const failedResponse = error as RequestFailed;
                console.error(`User update failied`, failedResponse.error);
                
                init = failedResponse.error;
            });
            
            return init;
        }
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