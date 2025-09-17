import { Match, type ParentComponent, Switch } from "solid-js";
import Profile from "./components/profile.tsx";
import Users from "./components/users.tsx";
import Settings from "./components/settings.tsx";
import {useTheme} from "./providers/theme.tsx";
import ThemeIcon from "./components/theme-icon.tsx";
import {useUserContext} from "./providers/user.tsx";
import {Show} from "solid-js/web";
import { Motion } from "@motionone/solid";
import EditProfile from "./components/edit-profile.tsx";
import ChangePassword from "./components/change-password.tsx";
import AddUser from "./components/add-user.tsx";
import { AccountsStateProvider, useAccountsContext, type AccountsPages, type AccountsPanels } from "./providers/accounts.tsx";

const PanelContent: ParentComponent<{ title?: AccountsPanels }> = (props) =>{
    const { closePanel } = useAccountsContext();

    return (
        <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
            <div class="panel-title" style={{ display: "flex", width: "100%", "align-items": "center", "flex-direction": "row" }}>
                <div onClick={closePanel} style={{ cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                        <path stroke-width="1" fill="currentColor" d="M9.193 9.249a.75.75 0 0 1 1.059-.056l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.004-1.115l1.048-.942H6.75a.75.75 0 1 1 0-1.5h3.546l-1.048-.942a.75.75 0 0 1-.055-1.06M22 17.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75zm-2.75 1.25c.69 0 1.25-.56 1.25-1.25V6.749c0-.69-.56-1.25-1.25-1.25h-3.254V18.5zm-4.754 0v-13H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25z"/>
                    </svg>
                </div>
                <h3 style={{ flex: 1, "text-align": "center" }}>{props.title}</h3>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
                {props.children}
            </div>
        </div>
    );
}


interface AccountOptionProps{
    label: string,
    page?: AccountsPages,
    clicked?: CallableFunction
}

const AccountOption: ParentComponent<AccountOptionProps> = (props) =>{
    const { choosePage, state } = useAccountsContext();

    const clicked = () =>{
        if(props.clicked){
            props.clicked();
        }else if(props.page){
            choosePage(props.page);
        }
    }

    return (
        <div onClick={clicked} class={`account-options ${state().currentPage === props.page ? "active" : "clicakble"}`}>
            {props.children}
            <span>{props.label}</span>
        </div>
    );
}

const Accounts = () => {
    const { toggle } = useTheme();
    const { userState } = useUserContext();
    const { state } = useAccountsContext();   

    return (
        <div class="account-container">
            <div style={{ display: "flex", width: "100%", "flex-direction": "row", "justify-content": "space-between", "align-items": "center", "padding": "2rem 2rem 0rem 2rem" }}>
                <h1 style={{"font-weight": "300" }}>Account Manangement</h1>
                <span id="theme-toggle" class="clicakble" onClick={toggle}>
                    <ThemeIcon />
                </span>
            </div>
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden", padding: "2rem 3rem 3rem 3rem" }}>
                <div style={{ display: "flex",  "flex-direction": "column"}} >
                    <div style={{ display: "flex",  "flex-direction": "column", flex: 1, gap: "1rem", padding: "1rem" }} >
                        <AccountOption label={ "Profile" } page={ "profile"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width={"2rem"} height={"2rem"} viewBox="0 0 48 48"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M24 27a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/><path d="M44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4s20 8.954 20 20M33.63 39.21A17.9 17.9 0 0 1 24 42a17.9 17.9 0 0 1-9.831-2.92q-.36-.45-.73-.93A2.14 2.14 0 0 1 13 36.845c0-1.077.774-1.98 1.809-2.131c6.845-1 11.558-.914 18.412.035A2.08 2.08 0 0 1 35 36.818c0 .48-.165.946-.463 1.31q-.461.561-.907 1.082m3.355-2.744c-.16-1.872-1.581-3.434-3.49-3.698c-7.016-.971-11.92-1.064-18.975-.033c-1.92.28-3.335 1.856-3.503 3.733A17.94 17.94 0 0 1 6 24c0-9.941 8.059-18 18-18s18 8.059 18 18a17.94 17.94 0 0 1-5.015 12.466"/></g></svg>
                        </AccountOption>
                        <Show when={userState().user?.users}>
                            <AccountOption label={ "Accounts" } page={ "users" }>
                                <svg xmlns="http://www.w3.org/2000/svg" width={"2rem"} height={"2rem"} viewBox="0 0 256 256"><path fill="currentColor" d="M107.19 159a56 56 0 1 0-46.38 0a91.83 91.83 0 0 0-53.93 38.81a4 4 0 1 0 6.7 4.37a84 84 0 0 1 140.84 0a4 4 0 1 0 6.7-4.37A91.83 91.83 0 0 0 107.19 159M36 108a48 48 0 1 1 48 48a48.05 48.05 0 0 1-48-48m212 95.35a4 4 0 0 1-5.53-1.17A83.81 83.81 0 0 0 172 164a4 4 0 0 1 0-8a48 48 0 1 0-17.82-92.58a4 4 0 1 1-3-7.43a56 56 0 0 1 44 103a91.83 91.83 0 0 1 53.93 38.86a4 4 0 0 1-1.11 5.5"/></svg>
                            </AccountOption>
                        </Show>
                        <AccountOption label={ "Settings" } page={ "settings" }>
                            <svg xmlns="http://www.w3.org/2000/svg" width={"1.6rem"} height={"1.6rem"} viewBox="0 0 24 24"><path fill="currentColor" d="M10.154 6.94a5.06 5.06 0 0 0-2.69 1.88a4.94 4.94 0 0 0-.63 3.938a4.33 4.33 0 0 0 2.7 3.05a5.8 5.8 0 0 0 2.819.24a6.5 6.5 0 0 0 2.57-1.05q.463-.313.859-.71q.29-.3.5-.66c.16-.314.268-.651.32-1a4.8 4.8 0 0 0 0-1.47a6 6 0 0 0-1.06-2.559a4.78 4.78 0 0 0-5.388-1.66M14.862 9c.448.665.726 1.43.81 2.229a3.6 3.6 0 0 1 0 1a2.2 2.2 0 0 1-.27.87a2 2 0 0 1-.46.509a4.4 4.4 0 0 1-.63.46c-.646.43-1.38.714-2.149.83a4.54 4.54 0 0 1-2.25-.2a3.27 3.27 0 0 1-1.999-2.25a4 4 0 0 1 .34-3.159a4.1 4.1 0 0 1 2.13-1.63A3.6 3.6 0 0 1 14.862 9"></path><path fill="currentColor" d="M23.98 10.469a3.2 3.2 0 0 0-.08-.78a1 1 0 0 0-.21-.43a1.26 1.26 0 0 0-.59-.38a3.7 3.7 0 0 0-.76-.13a3 3 0 0 1-1.25-.2a.76.76 0 0 1-.37-.55l-.22-1l-.16-.619c.09-.32.51-.53.7-.82a1 1 0 0 0 .14-.84a1.86 1.86 0 0 0-.47-.72c-.4-.42-1-.729-1.369-1.069c-.22-.19-.47-.49-.74-.71a1.8 1.8 0 0 0-.47-.29a1.07 1.07 0 0 0-.93.05c-.42.23-.74.79-1.07 1a.46.46 0 0 1-.329 0a3.5 3.5 0 0 1-.53-.12a3.2 3.2 0 0 1-.86-.34a.7.7 0 0 1-.3-.35l-.31-1.14a1.8 1.8 0 0 0-.08-.42a.5.5 0 0 0-.17-.24a1.2 1.2 0 0 0-.41-.17a1.6 1.6 0 0 0-.59-.06a.341.341 0 1 0 .06.68q.15-.02.3 0h.17v.25l.33 1.27c.11.286.305.531.56.7c.327.197.68.346 1.05.44q.395.135.81.18a1.17 1.17 0 0 0 .69-.17c.28-.18.56-.62.9-.88a.38.38 0 0 1 .38-.09q.2.102.36.26c.22.21.43.46.63.63s.779.55 1.139.88a1.2 1.2 0 0 1 .41.59c0 .14-.09.22-.19.32s-.29.27-.42.42q-.166.201-.25.45a1.1 1.1 0 0 0 0 .44q.063.33.17.649l.21 1a1.67 1.67 0 0 0 .73 1.07a4.1 4.1 0 0 0 1.63.35q.242.006.479.07a.36.36 0 0 1 .23.11l.06.599q.056.82-.01 1.64a1.07 1.07 0 0 1-.22.62l-.4.08a3.2 3.2 0 0 0-.7.29q-.253.142-.45.36c-.23.257-.428.543-.59.849q-.36.63-.64 1.3a3.1 3.1 0 0 0-.25 1.23c.021.444.144.879.36 1.269c.11.22.31.5.42.78c0 .09.09.17 0 .24l-1.529 1.14l-.43.28l-.84-.57a2.6 2.6 0 0 0-1.2-.29a4.15 4.15 0 0 0-1.629.44a4 4 0 0 0-.89.52c-.18.146-.314.34-.39.559l-.26 1.45l-.06.12a3 3 0 0 1-.59 0c-.429-.06-.859-.16-1.259-.21l-.45-.09a.35.35 0 0 1-.2-.07c-.32-.28-.35-.72-.58-1a1.54 1.54 0 0 0-.7-.53l-1.519-.49c-.25-.09-.52-.23-.79-.31a1.7 1.7 0 0 0-.5-.08c-.186 0-.37.04-.54.12a2.2 2.2 0 0 0-.55.36q-.133.15-.309.25a5 5 0 0 0-.37-.3c-.37-.28-.79-.54-1.15-.85a2.1 2.1 0 0 1-.5-.58a.57.57 0 0 1 0-.51c.2-.49.59-.999.72-1.419a1.6 1.6 0 0 0 0-.7a6.5 6.5 0 0 0-.39-1.09l-.26-.53a1.4 1.4 0 0 0-.67-.56a2.3 2.3 0 0 0-.69-.08a1 1 0 0 1-.459-.1c0-.069-.07-.319-.11-.429c-.11-.47-.28-.87-.43-1.29a2.7 2.7 0 0 1 0-.75a.55.55 0 0 1 .19-.43q.65-.304 1.25-.699a1.2 1.2 0 0 0 .24-.3c.11-.17.19-.37.28-.53s.36-.6.52-.9a3.7 3.7 0 0 0 .29-.71a1.47 1.47 0 0 0-.09-1.059a8 8 0 0 0-.73-1a1.2 1.2 0 0 1-.16-.27c0-.07-.07-.15 0-.22a4 4 0 0 1 .53-.64q.472-.46 1-.86q.198-.162.43-.28a.85.85 0 0 1 .399-.1l.35.28a4 4 0 0 0 .56.42q.222.134.47.21c.231.07.478.07.71 0q.562-.254 1.08-.59l.469-.27l.37-.259a.9.9 0 0 0 .34-.62a1.7 1.7 0 0 0-.07-.6a.83.83 0 0 1 0-.47l.31-.15q.37-.158.77-.22q.62-.112 1.25-.16a.3.3 0 1 0 0-.6q-.688.046-1.36.19a5 5 0 0 0-.93.25a2.6 2.6 0 0 0-.47.16a.63.63 0 0 0-.21.28c-.15.42.09.8 0 1.16a.26.26 0 0 1-.11.18l-.28.19l-.4.27c-.23.11-.54.34-.86.47a.67.67 0 0 1-.4.08a2 2 0 0 1-.38-.2c-.13-.09-.26-.2-.38-.3a2.5 2.5 0 0 0-.43-.37a.8.8 0 0 0-.349-.11a1.4 1.4 0 0 0-.63.11q-.389.154-.72.41q-.574.42-1.1.9a4.6 4.6 0 0 0-.65.75a.9.9 0 0 0-.1.69c.047.268.157.522.32.74q.36.426.64.909a.68.68 0 0 1 0 .47a2.7 2.7 0 0 1-.25.54c-.16.3-.35.58-.52.86l-.34.6c-.439.38-1.059.459-1.419.819a1.36 1.36 0 0 0-.41.91c-.02.336.01.673.09 1c.1.45.27.89.41 1.329a4 4 0 0 0 .14.55a.83.83 0 0 0 .3.39c.243.195.532.322.84.37q.255.008.5.08a.37.37 0 0 1 .17.16l.17.36q.141.327.25.67a.8.8 0 0 1 .07.44c-.16.519-.66.999-.81 1.609a1.54 1.54 0 0 0 .13 1.14c.193.342.447.647.75.9c.37.319.81.589 1.19.889q.266.25.58.44c.188.102.406.14.619.11a1.7 1.7 0 0 0 .48-.19q.248-.162.47-.36c.09-.07.18-.18.3-.18a.9.9 0 0 1 .27.06c.22.08.44.19.65.27l1.519.44a.44.44 0 0 1 .18.14c.27.38.36.89.74 1.22c.138.118.298.21.47.27q.413.11.84.15c.47.06.999.19 1.489.23q.385.036.77 0a.9.9 0 0 0 .46-.21c.171-.165.307-.362.4-.58a2.4 2.4 0 0 0 .16-.58q.04-.504.14-1c0-.09.15-.12.25-.18s.3-.14.41-.19a3.4 3.4 0 0 1 .999-.33c.29-.04.587.009.85.14c.23.12.55.43.84.56a1 1 0 0 0 .46.12a1.1 1.1 0 0 0 .489-.09q.339-.157.63-.39l1.6-1.27a1.11 1.11 0 0 0 .39-.93a4.3 4.3 0 0 0-.59-1.39a1.65 1.65 0 0 1-.23-.779a2.05 2.05 0 0 1 .17-.83q.225-.62.52-1.21q.18-.38.45-.71a.9.9 0 0 1 .27-.199q.187-.096.389-.16c.13 0 .3-.05.44-.1a1.1 1.1 0 0 0 .33-.19c.273-.27.451-.62.51-1q.12-.936.06-1.88"></path></svg>
                        </AccountOption>
                    </div>
                    <div style={{ display: "flex",  "flex-direction": "column", gap: "2rem", padding: "1rem" }} >
                        <AccountOption label={ "Logout" }>
                            <svg xmlns="http://www.w3.org/2000/svg" width={"2rem"} height={"2rem"} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.393 4C4 4.617 4 5.413 4 7.004v9.994c0 1.591 0 2.387.393 3.002q.105.165.235.312c.483.546 1.249.765 2.78 1.202c1.533.438 2.3.657 2.856.329a1.5 1.5 0 0 0 .267-.202C11 21.196 11 20.4 11 18.803V5.197c0-1.596 0-2.393-.469-2.837a1.5 1.5 0 0 0-.267-.202c-.555-.328-1.323-.11-2.857.329c-1.53.437-2.296.656-2.78 1.202a2.5 2.5 0 0 0-.234.312M11 4h2.017c1.902 0 2.853 0 3.443.586c.33.326.476.764.54 1.414m-6 14h2.017c1.902 0 2.853 0 3.443-.586c.33-.326.476-.764.54-1.414m4-6h-7m5.5-2.5S22 11.34 22 12s-2.5 2.5-2.5 2.5"/></svg>
                        </AccountOption>
                    </div>
                </div>
                <div class="horizontal-line"/>
                <Switch>
                    <Match when={ state().currentPage === "profile"}>
                        <Profile />
                    </Match>
                    <Match when={state().currentPage === "users"}>
                        <Users />
                    </Match>
                    <Match when={ state().currentPage === "settings"}>
                        <Settings />
                    </Match>
                </Switch>
            </div>
            <Motion.div initial={{ x: "100%" }} animate={{ x: state().panelState.show ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }} class="panel">
                <PanelContent title={state().panelState.panel}>
                    <Switch>
                        <Match when={state().panelState.panel === "Edit Profile"}>
                            <EditProfile />
                        </Match>
                        <Match when={state().panelState.panel === "Change Password"}>
                            <ChangePassword />
                        </Match>
                        <Match when={state().panelState.panel === "Create User"}>
                            <AddUser />
                        </Match>
                    </Switch>
                </PanelContent>
            </Motion.div>
        </div>
    );
}


export default () =>{
    return (
        <AccountsStateProvider>
            <Accounts />
        </AccountsStateProvider>
    );
};