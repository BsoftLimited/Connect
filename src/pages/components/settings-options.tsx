import { Show, type ParentComponent } from "solid-js";
import { useUserContext } from "../providers/user";
import { useAppContext } from "../providers/app";

const SettingsOptions: ParentComponent = (props) => {
    const { userState, logout } = useUserContext();

    const toAccounts = () => window.location.href = "/accounts";

    return (
        <div class="settings-container">
            <h4>Settings</h4>
            <Show when={userState().user?.role === "admin"}>
                <div onClick={toAccounts} style={{ display: "flex", "flex-direction": "row", gap: "0.6rem", "align-items": "center", "cursor": "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 19.5c0-1.657-2.239-3-5-3s-5 1.343-5 3m14-3c0-1.23-1.234-2.287-3-2.75M3 16.5c0-1.23 1.234-2.287 3-2.75m12-4.014a3 3 0 1 0-4-4.472M6 9.736a3 3 0 0 1 4-4.472m2 8.236a3 3 0 1 1 0-6a3 3 0 0 1 0 6"/></svg>
                    <span>Manage Users</span>
                </div>
            </Show>
            <div onClick={logout} style={{ display: "flex", "flex-direction": "row", gap: "0.6rem", "align-items": "center", "cursor": "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.393 4C4 4.617 4 5.413 4 7.004v9.994c0 1.591 0 2.387.393 3.002q.105.165.235.312c.483.546 1.249.765 2.78 1.202c1.533.438 2.3.657 2.856.329a1.5 1.5 0 0 0 .267-.202C11 21.196 11 20.4 11 18.803V5.197c0-1.596 0-2.393-.469-2.837a1.5 1.5 0 0 0-.267-.202c-.555-.328-1.323-.11-2.857.329c-1.53.437-2.296.656-2.78 1.202a2.5 2.5 0 0 0-.234.312M11 4h2.017c1.902 0 2.853 0 3.443.586c.33.326.476.764.54 1.414m-6 14h2.017c1.902 0 2.853 0 3.443-.586c.33-.326.476-.764.54-1.414m4-6h-7m5.5-2.5S22 11.34 22 12s-2.5 2.5-2.5 2.5"/></svg>
                <span>Logout</span>
            </div>
        </div>
    );
}

export default SettingsOptions;