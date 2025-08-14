import { render, Show } from "solid-js/web";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory from "../components/directory";
import { AppContextProvider, useAppContext } from "../providers/app";
import { ThemeProvider } from "../providers/theme";
import Streaming from "../components/streaming";

import { UploadContextProvider } from "../providers/upload";
import { ContextMenuProvider } from "../providers/context-menu";

export const App = () =>{
    const { state } = useAppContext();

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <ContextMenuProvider>
                    <Show when={state().target === "stream"} fallback={<Directory />}>
                        <Streaming />
                    </Show>
                </ContextMenuProvider>
            </div>
        </div>
    );
}

render(() => (
    <AppContextProvider>
        <ThemeProvider>
            <UploadContextProvider>
                <App />
            </UploadContextProvider>
        </ThemeProvider>
    </AppContextProvider>
), document.getElementById("root")!);