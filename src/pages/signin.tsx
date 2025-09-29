import { createSignal, JSX, Match, Show, Switch } from "solid-js";
import { render } from "solid-js/web";
import { SystmeProvider, useSystem } from "./providers/system";
import Login from "./components/login";
import SignUp from "./components/signup";
import type { User } from "../common";
import CreatePassword from "./components/create-password";

const Signin = () =>{
    const { systemState } = useSystem();
    const [state, setState] = createSignal<"login" | "signup">("login");
    const [user, setUser] = createSignal<User>();

    const activeButton: JSX.CSSProperties = {
        border: "solid 2px white",
        color: "grey",
        background: "white"
    }

    const inActiveButton: JSX.CSSProperties = {
        border: "solid 2px white",
        color: "white",
        background: "transparent",
    }

    return (
        <div class="login-container" style={{ display: "flex", "flex-direction": "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
            <div class="container">
                <div class="form-container">
                    <Show when={!user()}>
                        <Show when={systemState().data?.allowGuestSignup}>
                            <div style={{ display: "flex", "flex-direction": "row", gap: "1rem", width: "100%", "margin-bottom": "1rem" }}>
                                <button style={{ flex: 1, padding: "0.8rem", "border-radius": "6px", "font-size": "16px", "font-weight": "lighter", ...(state() === "login" ? activeButton : inActiveButton) }} onClick={ ()=> setState("login") }>
                                    Login
                                </button>
                                <button style={{ flex: 1, padding: "0.8rem", "border-radius": "6px", "font-size": "16px", "font-weight": "lighter", ...(state() === "signup" ? activeButton : inActiveButton) }} onClick={ ()=> setState("signup") }>
                                    Register as Guest
                                </button>
                            </div>
                        </Show>
                        <Show when={state() === "signup" && systemState().data?.allowGuestSignup} fallback={ <Login setUser={setUser}/> }>
                            <SignUp />
                        </Show>
                    </Show>
                    <Show when={user()}>
                        <CreatePassword />
                    </Show>
                </div>
            </div>
        </div>
    );
}

const Page = () =>{
    const { systemState } = useSystem();
    
    return (
        <Show when={systemState().data} fallback={<div>{"Loading..."}</div>}>
            <Signin />
        </Show>
    );
}

const root = document.getElementById("root");
if(root){
    render(() => (
        <SystmeProvider>
            <Page />
        </SystmeProvider>
    ), root);
}else{
    console.log("root element not found");
}