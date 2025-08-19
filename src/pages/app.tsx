import { render, Show } from "solid-js/web";
import Directory from "./components/directory";
import SideBar from "./components/sidebar";
import Streaming from "./components/streaming";
import TopBar from "./components/topbar";
import { useAppContext, AppContextProvider } from "./providers/app";
import { ContextMenuProvider } from "./providers/context-menu";
import { ThemeProvider } from "./providers/theme";
import { UploadContextProvider } from "./providers/upload";

export const App = () =>{
    const { appState } = useAppContext();

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <ContextMenuProvider>
                    <Show when={appState().target === "stream"} fallback={<Directory />}>
                        <Streaming />
                    </Show>
                </ContextMenuProvider>
            </div>
        </div>
    );
}

const root = document.getElementById("root");

if(root){
    render(() => (
        <AppContextProvider>
            <ThemeProvider>
                <UploadContextProvider>
                    <App />
                </UploadContextProvider>
            </ThemeProvider>
        </AppContextProvider>
    ), root);
}else{
    console.log("root element not found");
}