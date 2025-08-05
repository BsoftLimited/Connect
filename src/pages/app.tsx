import { render } from "solid-js/web";
import { type Component } from "solid-js";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory from "../components/directory";

const App: Component = () =>{
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Directory details={props.details}/>
            </div>
        </div>
    );
}

render(() => <App />, document.getElementById("root")!);