import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import AllProviders from "./providers";
import { lazy } from "solid-js";


const App = lazy(() => import("./app"));
const Accounts = lazy(() => import("./accounts"));

const root = document.getElementById("root");
if(root){
    render(() => (
        <AllProviders>
            <Router>
                <Route path="*" component={App} />
                <Route path="/accounts" component={Accounts} />
            </Router>
        </AllProviders>
    ), root);
}else{
    console.log("root element not found");
}