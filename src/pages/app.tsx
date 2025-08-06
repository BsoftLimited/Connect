import { render } from "solid-js/web";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory from "../components/directory";
import { AppContextProvider } from "../providers/app";
import { CounterProvider, useCounter } from "../providers/counter";
import { ThemeProvider } from "../providers/theme";

const App = () =>{
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh", "flex-direction": "column", overflow: "hidden" }}>
            <TopBar />
            <div style={{ display: "flex", width: "100%", flex: 1, "flex-direction": "row", overflow: "hidden" }}>
                <SideBar />
                <Directory />
            </div>
        </div>
    );
}

const Test = () =>{
    const { count, increment } = useCounter();

    return (
        <div>
        <p>Count: {count()}</p>
        <button onClick={increment}>Increment</button>
        </div>
    );
}

render(() => (
    <AppContextProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </AppContextProvider>
), document.getElementById("root")!);