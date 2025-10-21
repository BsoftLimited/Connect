import { Show } from "solid-js/web";
import Directory from "./components/directory";
import SideBar from "./components/sidebar";
import Streaming from "./components/streaming";
import TopBar from "./components/topbar";
import { AppProvider, useAppContext } from "./providers/app";
import { UploadContextProvider } from "./providers/upload";
import { Match, Switch } from "solid-js";
import Notifiactions from "./components/notifications";
import Upload from "./components/upload";
import Panel from "./components/panel";

export const App = () =>{
    const { pageState, closePanel, openPanel } = useAppContext();

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar openNotifications={()=> openPanel("Notifications")}/>
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Show when={pageState().currentPage === "Streaming"} fallback={<Directory />}>
                    <Streaming />
                </Show>
            </div>
            <Panel title={pageState().panelState.panel} show={ pageState().panelState.show} close={closePanel}>
                <Switch>
                    <Match when={pageState().panelState.panel === "Notifications"}>
                        <Notifiactions />
                    </Match>
                    <Match when={pageState().panelState.panel === "Upload File"}>
                        <Upload/>
                    </Match> 
                </Switch>
            </Panel>
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