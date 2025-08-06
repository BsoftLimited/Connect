import { render } from "solid-js/web";
import { type Component } from "solid-js";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory from "../components/directory";
import AppContextProvider, { useAppContext } from "../providers/app";

const App: Component = () =>{
    const { isError, directory, loading, error } = useAppContext();

    if(loading){
        return (<div>Loading...</div>);
    }

    if(error){
        return (
            <div>{JSON.stringify(error)}</div>
        );
    }

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Directory details={directory!}/>
            </div>
        </div>
    );
}

render(() => (
    <AppContextProvider>
        <App />
    </AppContextProvider>
), document.getElementById("root")!);