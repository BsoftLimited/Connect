import { createContext, createSignal, useContext, type ParentComponent } from "solid-js";

export type AccountsPages = "profile" | "users" | "settings"
export type AccountsPanels = "Edit Profile" | "Change Password" | "Create User";

export type AccountsPanelsState = {
    show: boolean,
    panel?: AccountsPanels
}

type AccountsState = {
    currentPage: AccountsPages,
    panelState: AccountsPanelsState,
}

type AccountsStateType = {
    state: () => AccountsState,
    closePanel: () => void,
    openPanel: (panel: AccountsPanels) => void,
    choosePage: (page: AccountsPages) => void,
}

const AccountsStateContext = createContext<AccountsStateType>();

const AccountsStateProvider: ParentComponent = (props) =>{
    const [state, setState] = createSignal<AccountsState>({ currentPage: "profile", panelState: { show: false } });

    const accountsStateType: AccountsStateType = {
        state,
        closePanel: () =>{
            setState((init)=>{
                return {...init, panelState: { show: false }}
            });
        },
        openPanel: (panel: AccountsPanels) => {
            setState((init)=>{
                return {...init, panelState: { show: true, panel } }
            });
        },
        choosePage: (page) => {
            setState((init)=>{
                return {...init, currentPage: page }
            });
        },
    };

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