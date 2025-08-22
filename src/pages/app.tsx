import { Show } from "solid-js/web";
import Directory from "./components/directory";
import SideBar from "./components/sidebar";
import Streaming from "./components/streaming";
import TopBar from "./components/topbar";
import { AppContextProvider, useAppContext } from "./providers/app";
import { UploadContextProvider } from "./providers/upload";

export const App = () =>{
    const { appState } = useAppContext();

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Show when={appState().target === "stream"} fallback={<Directory />}>
                    <Streaming />
                </Show>
            </div>
        </div>
    );
}

export default () =>{
    return (
        <AppContextProvider>
            <UploadContextProvider>
                <App />
            </UploadContextProvider>
        </AppContextProvider>
    );
};