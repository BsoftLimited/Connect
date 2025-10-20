import { Show } from "solid-js/web";
import Directory from "./components/directory";
import SideBar from "./components/sidebar";
import Streaming from "./components/streaming";
import TopBar from "./components/topbar";
import { AppProvider, useAppContext } from "./providers/app";
import { UploadContextProvider } from "./providers/upload";
import { createSignal, Match, Switch } from "solid-js";
import Notifiactions from "./components/notifications";
import { Motion } from "@motionone/solid";
import PanelContent from "./components/panel";
import Upload from "./components/upload";

export const App = () =>{
    const { appState, pageState, closePanel } = useAppContext();

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Show when={pageState().currentPage === "Streaming"} fallback={<Directory />}>
                    <Streaming />
                </Show>
            </div>
            <Motion.div initial={{ x: "100%" }} animate={{ x: pageState().panelState.show ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }} class="panel">
                <PanelContent title={pageState().panelState.panel}>
                    <Switch>
                        <Match when={pageState().panelState.panel === "Notifications"}>
                            <Notifiactions open={showNotifications()} onClocse={()=> setShowNotifiations(false)} />
                        </Match>
                        <Match when={pageState().panelState.panel === "Upload File"}>
                            <Upload/>
                        </Match> 
                    </Switch>
                </PanelContent>
            </Motion.div>
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