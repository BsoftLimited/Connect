import {type Component, createSignal, For} from "solid-js";
import {Show} from "solid-js/web";
import { useAccountsContext } from "../providers/accounts.tsx";
import type { User } from "../../common/user.ts";
import { formatAccessLevel } from "../../utils/util.ts";

interface UserViewProps{
    user: User
}

const UserView: Component<UserViewProps> = (props) =>{
    return (
        <div>
            <div style={{ display: "flex", "flex-direction": "row", cursor: "pointer", "max-width": "12rem" }}>
                <div style={{ display: "flex", "flex-direction": "column", "border": "solid 2px grey", color: "grey", "align-items": "center", "justify-content": "center", "border-radius": "10px", width: "100%", padding: "1rem", gap: "4px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 26 26">
                        <path fill="currentColor" d="M16.563 15.9c-.159-.052-1.164-.505-.536-2.414h-.009c1.637-1.686 2.888-4.399 2.888-7.07c0-4.107-2.731-6.26-5.905-6.26c-3.176 0-5.892 2.152-5.892 6.26c0 2.682 1.244 5.406 2.891 7.088c.642 1.684-.506 2.309-.746 2.397c-3.324 1.202-7.224 3.393-7.224 5.556v.811c0 2.947 5.714 3.617 11.002 3.617c5.296 0 10.938-.67 10.938-3.617v-.811c0-2.228-3.919-4.402-7.407-5.557"/>
                    </svg>
                    <div style={{ "font-size": "14px", "font-weight": "300" }}>{props.user.username}</div>
                    <div style={{ "font-size": "12px", "font-weight": "500" }}>{ formatAccessLevel(props.user) }</div>
                </div>
                <div style={{ display: "flex", "flex-direction": "column" }}>

                </div>
            </div>
        </div>
    );
}

const CreateUserView = () =>{
    const { openPanel } = useAccountsContext();
    
    const createUser = () => openPanel("Create User");

    return (
        <div class={"create-user-container"} onClick={createUser}>
            <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 30 26">
                <path fill="currentColor" d="M10.5.156c-3.017 0-5.438 2.072-5.438 6.032c0 2.586 1.03 5.22 2.594 6.843c.61 1.623-.49 2.227-.718 2.313C3.781 16.502.093 18.602.093 20.688v.78c0 2.843 5.414 3.5 10.437 3.5a46 46 0 0 0 3.281-.124a7.75 7.75 0 0 1-2.124-5.344c0-1.791.61-3.432 1.624-4.75c-.15-.352-.21-.907.063-1.75c1.555-1.625 2.563-4.236 2.563-6.813c0-3.959-2.424-6.03-5.438-6.03zm9 13.031a6.312 6.312 0 1 0 0 12.625a6.312 6.312 0 0 0 0-12.625M18.625 16h1.75v2.594h2.594v1.812h-2.594V23h-1.75v-2.594H16v-1.812h2.625z"/>
            </svg>
        </div>
    );
}

const LoadingUsers = () =>{
    return (
        <div style={{ width: "100%", display: "flex", "flex-direction": "row", "justify-content": "center", "align-items": "center", height: "100%" }}>
            <div class="loader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="2" r="0" fill="currentColor">
                        <animate attributeName="r" begin="0" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(45 12 12)">
                        <animate attributeName="r" begin="0.125s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(90 12 12)">
                        <animate attributeName="r" begin="0.25s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(135 12 12)">
                        <animate attributeName="r" begin="0.375s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(180 12 12)">
                        <animate attributeName="r" begin="0.5s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(225 12 12)">
                        <animate attributeName="r" begin="0.625s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(270 12 12)">
                        <animate attributeName="r" begin="0.75s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                    <circle cx="12" cy="2" r="0" fill="currentColor" transform="rotate(315 12 12)">
                        <animate attributeName="r" begin="0.875s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/>
                    </circle>
                </svg>
            </div>
        </div>
    );
}


const Users: Component = () =>{
    const { state } = useAccountsContext();

    const indices = () =>{
        return [...state().users, 1].map((_, index) => index);
    }

    return (
        <div style={{ width: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Accounts</h1>
            <Show when={!state().loading} fallback={<LoadingUsers />}>
                <div class={"users-container"}>
                    <For each={indices()}>
                        {(item) => (
                            <Show when={item < state().users.length} fallback={<CreateUserView />}>
                                <UserView user={state().users[item]!}/>
                            </Show>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

export default Users;