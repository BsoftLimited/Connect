import { createContext, createSignal, onMount, Show, useContext, type ParentComponent } from "solid-js";
import type { CreateUserData, EditUserFailed, EditUserFormData, UpdateProfileData, UpdateProfileFailed, User } from "../../common";
import { useUserContext } from "./user";
import { request } from "../../utils/util";
import DeleteUser from "../popups/delete-user";
import usePageHook, { type PageState } from "../../utils/page-hook";

export type AccountsPages = "profile" | "users" | "settings"
export type AccountsPanels = "Edit Profile" | "Change Password" | "Create User" | "User Details" | "Delete User" | "Notifications";

type AccountsState = {
    loading: boolean;
    users: User[];
    error?: any;
}

type PopUpState = {
    action: "None" | "Delete_User",
    user?: User
}

export type CreateUserFailedResult = {message?: string, error?: Partial<CreateUserData>};
type AccountsStateType = {
    state: () => AccountsState,
    pageState: () => PageState<AccountsPages, AccountsPanels>,
    closePanel: () => void,
    openPanel: (panel: AccountsPanels) => void,
    choosePage: (page: AccountsPages) => void,
    createUser: (data: CreateUserData) => Promise<CreateUserFailedResult>,
    deleteUser: (user: User) => Promise<void>,
    updateProfile: (data: UpdateProfileData) => Promise<UpdateProfileFailed>,
    updateUser: (data: EditUserFormData) => Promise<EditUserFailed>
}

const AccountsStateContext = createContext<AccountsStateType>();

const AccountsStateProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AccountsState>({ loading: false, users: [] });
    const {sessionState} = useUserContext();
    const [popUpState, setPopUpState] = createSignal<PopUpState>({ action: "None" });

    const pageHook = usePageHook<AccountsPages, AccountsPanels>("profile");

    const closePopup = () =>{
        setPopUpState({ action: "None" });
    }

    const fetchUsers = async () => {
        setState(init => ({ ...init, loading: true, error: undefined }));
        try {
            const result = await request({ url: '/api/users' });
            if (result.isFirst) {
                const response = result.first;
                if(response.status === 200){
                    const users = await response.data as User[];
                    setState(init => ({ ...init, loading: false, users }));
                }
            }else{
                const response = result.second;
                console.error("Error fetching user:", response.error);
                setState(init => ({ ...init, loading: false, error: response.error.message }));
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setState(init => ({ ...init, loading: false, error: "Failed to load users" }));
        }
    };

    const accountsStateType: AccountsStateType = {
        state,
        ...pageHook,
        createUser: async (data: CreateUserData): Promise<CreateUserFailedResult> =>{
            let init: CreateUserFailedResult = {};
            try{
                const result = await request({ url: `/api/user`, input: data, method: "POST" });
                if(result.isFirst){
                    const response = result.first;
                    if(response.status === 201){
                        const newUser = response.data as User;
                        setState(init => ({ ...init, users: [...init.users, newUser] }));
                        alert("User created successfully");
                        pageHook.closePanel();
                    }
                }else{
                    const response = result.second;
                    console.error(response.error);
                    
                    if(response.status === 401){
                        init = ({ ...response.error });
                    }else{
                        console.error(response.error);
                        init = { message: response.error.message };
                    }
                }
            }catch(error){
                console.error(error);
                init = { message: "An error occured when trying to create user." };
            }
            return init;
        },
        deleteUser: async (user: User) =>{
            setPopUpState({ action: "Delete_User", user });
        },
        updateProfile: async (data: UpdateProfileData) =>{
            let init: UpdateProfileFailed = {};
            try{
                const result = await request({ url: `/api/user`, method: "PATCH", input: data });
                if(result.isFirst){
                    const response = result.first;
                        if (response.status === 200) {
                        fetchUsers().finally(()=>{
                            pageHook.closePanel()
                        });
                    }
                }else{
                    const response = result.second;
                    init = response.error;
                }
            }catch(error){
                console.error(error);
                init = { message: "Unable to perform profile update opertion" };
            }
            return init;
        },
        updateUser: async (data: EditUserFormData): Promise<EditUserFailed> =>{
            let init: EditUserFailed = {}
            try{
                const result = await request({ url: `/api/user/access`, input: data, method: "PATCH" });
                if(result.isFirst){
                    const response = result.first;
                    if(response.status === 200){
                        alert("User update successfully");
                        fetchUsers().finally(()=>{
                            pageHook.closePanel();
                        });
                    }
                }else{
                    const response = result.second;
                    console.error(`User update failied`, response.error);
                    init = response.error;
                }
            }catch(error){
                console.error(`User update failied`, error);
                init = { message: "user update request failed, check connection" }
            }            
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
            <Show when={popUpState().action === "Delete_User"}>
                <DeleteUser user={popUpState().user!} cancel={closePopup} done={()=>{
                    fetchUsers().finally(closePopup);
                }}/>
            </Show>
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