import { Show } from "solid-js/web";
import Directory from "./components/directory";
import SideBar from "./components/sidebar";
import Streaming from "./components/streaming";
import TopBar from "./components/topbar";
import { AppProvider, useAppContext } from "./providers/app";
import { UploadContextProvider } from "./providers/upload";
import { createSignal } from "solid-js";
import Notifiactions from "./components/notifications";

export const App = () =>{
    const { appState } = useAppContext();
    const [showNotifications, setShowNotifiations] = createSignal(false);

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar openNotifications={()=> setShowNotifiations(true)}/>
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Show when={appState().target === "stream"} fallback={<Directory />}>
                    <Streaming />
                </Show>
            </div>
            <Notifiactions open={showNotifications()} onClocse={()=> setShowNotifiations(false)} />
        </div>
    );
}

export default () =>{
    return (
        <AppProvider>
            <UploadContextProvider>
                <App />
            </UploadContextProvider>
        </AppProvider>
    );
};