import { render } from "solid-js/web";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory from "../components/directory";
import { AppContextProvider } from "../providers/app";
import { ThemeProvider } from "../providers/theme";
import { Route, Router } from "@solidjs/router";
import Streaming from "../components/streaming";

import { UploadContextProvider } from "../providers/upload";
import { ContextMenuProvider } from "../providers/context-menu";

export const App = () =>{
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Router>
                    <Route path="/" component={Directory} />
                    <Route path="/streaming/*" component={Streaming} />
                </Router>
            </div>
        </div>
    );
}

render(() => (
    <ContextMenuProvider>
        <AppContextProvider>
            <ThemeProvider>
                <UploadContextProvider>
                    <App />
                </UploadContextProvider>
            </ThemeProvider>
        </AppContextProvider>
    </ContextMenuProvider>
), document.getElementById("root")!);