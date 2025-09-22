import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { lazy, Match, Switch, type Component } from "solid-js";
import { UserProvider, useUserContext } from "./providers/user";

const App = lazy(() => import("./app"));
const Accounts = lazy(() => import("./accounts"));

const Screen: Component = () => {
    const { sessionState } = useUserContext();
    
    return (
        <Switch>
            <Match when={sessionState().loading}>
                <div class="loading-screen"><div class="loader"/>Loading...</div>
            </Match>
            <Match when={sessionState().data}>
                <Router>
                    <Route path="*" component={App} />
                    <Route path="/accounts" component={Accounts} />
                </Router>
            </Match>
            <Match when={sessionState().error && !sessionState().loading}>
                <div class="error-screen">
                    <h1>Error</h1>
                    <p>{sessionState().error}</p>
                    <p>Please refresh the page or contact the administrator.</p>
                </div>
            </Match>
        </Switch>
    );
};

const root = document.getElementById("root");
if(root){
    render(() => (
        <UserProvider>
            <Screen />
        </UserProvider>
    ), root);
}else{
    console.log("root element not found");
}