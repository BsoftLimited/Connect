import {type Component, createSignal, For, Match, Switch} from "solid-js";
import {Show} from "solid-js/web";
import { useAccountsContext } from "../providers/accounts.tsx";
import type { User } from "../../common";
import { formatAccessLevel } from "../../utils/util.ts";

interface UserViewProps{
    user: User;
    edit: ()=>void;
}

const UserView: Component<UserViewProps> = (props) =>{
    return (
        <div style={{ display: "flex", "flex-direction": "row", cursor: "pointer", "max-width": "15rem" }} onClick={props.edit}>
            <div style={{ display: "flex", "flex-direction": "column", "border": "solid 2px white", "background-color": "white", color: "grey", "align-items": "center", "justify-content": "center", "border-radius": "10px", width: "100%", padding: "1rem", gap: "4px"}}>
                <Switch>
                    <Match when={props.user.role === "guest"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 26 26">
                            <path fill="currentColor" d="M16.563 15.9c-.159-.052-1.164-.505-.536-2.414h-.009c1.637-1.686 2.888-4.399 2.888-7.07c0-4.107-2.731-6.26-5.905-6.26c-3.176 0-5.892 2.152-5.892 6.26c0 2.682 1.244 5.406 2.891 7.088c.642 1.684-.506 2.309-.746 2.397c-3.324 1.202-7.224 3.393-7.224 5.556v.811c0 2.947 5.714 3.617 11.002 3.617c5.296 0 10.938-.67 10.938-3.617v-.811c0-2.228-3.919-4.402-7.407-5.557"/>
                        </svg>
                    </Match>
                    <Match when={props.user.role === "user"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 26 26">
                            <path fill="currentColor" d="M16.563 15.9c-.159-.052-1.164-.505-.536-2.414h-.009c1.637-1.686 2.888-4.399 2.888-7.07c0-4.107-2.731-6.26-5.905-6.26c-3.176 0-5.892 2.152-5.892 6.26c0 2.682 1.244 5.406 2.891 7.088c.642 1.684-.506 2.309-.746 2.396c-3.324 1.203-7.224 3.394-7.224 5.557v.811c0 2.947 5.714 3.617 11.002 3.617c5.296 0 10.938-.67 10.938-3.617v-.811c0-2.228-3.919-4.402-7.407-5.557m-5.516 8.709c0-2.549 1.623-5.99 1.623-5.99l-1.123-.881c0-.842 1.453-1.723 1.453-1.723s1.449.895 1.449 1.723l-1.119.881s1.623 3.428 1.623 6.018c0 .406-3.906.312-3.906-.028"/>
                        </svg>
                    </Match>
                </Switch>
                <div style={{ "font-size": "14px", "font-weight": "300" }}>{props.user.username}</div>
                <div style={{ "font-size": "12px", "font-weight": "500" }}>{ formatAccessLevel(props.user) }</div>
            </div>
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem", "margin-left": "0.5rem" }}>
                <div style={{ width: "3rem", height: "3rem", "background-color": "var(--md-sys-color-surface-container-highest)", "border-radius": "10px", display: "flex", "align-items": "center", "justify-content": "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.8rem" height="1.8rem" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2 2 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.62 1.62 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.03 2.03 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361s-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a2 2 0 0 0-.399 1.479c.053.394.287.798.757 1.605s.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2 2 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a2 2 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361s.306-1.064.782-1.36c.324-.203.533-.364.682-.556a2 2 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605s-.704-1.21-1.022-1.453a2.03 2.03 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.62 1.62 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2 2 0 0 0-1.09-1.083" clip-rule="evenodd" opacity="0.5"/>
                        <path fill="currentColor" d="M15.523 12c0 1.657-1.354 3-3.023 3s-3.023-1.343-3.023-3S10.83 9 12.5 9s3.023 1.343 3.023 3"/>
                    </svg>
                </div>
                <div style={{ width: "3rem", height: "3rem", "background-color": "var(--md-sys-color-surface-container-highest)", "border-radius": "10px", display: "flex", "align-items": "center", "justify-content": "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.8rem" height="1.8rem" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                        <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/><path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                    </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="8rem" height="8rem" viewBox="0 0 30 26">
                <path fill="currentColor" d="M10.5.156c-3.017 0-5.438 2.072-5.438 6.032c0 2.586 1.03 5.22 2.594 6.843c.61 1.623-.49 2.227-.718 2.313C3.781 16.502.093 18.602.093 20.688v.78c0 2.843 5.414 3.5 10.437 3.5a46 46 0 0 0 3.281-.124a7.75 7.75 0 0 1-2.124-5.344c0-1.791.61-3.432 1.624-4.75c-.15-.352-.21-.907.063-1.75c1.555-1.625 2.563-4.236 2.563-6.813c0-3.959-2.424-6.03-5.438-6.03zm9 13.031a6.312 6.312 0 1 0 0 12.625a6.312 6.312 0 0 0 0-12.625M18.625 16h1.75v2.594h2.594v1.812h-2.594V23h-1.75v-2.594H16v-1.812h2.625z"/>
            </svg>
        </div>
    );
}

const NoUsers = () =>{
    return (
        <div style={{ display: "flex", "justify-content": "center", "align-items": "center", width: "100%", height: "100%" }}>
            <CreateUserView />
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

interface UsersProps{
    edit: (user: User) => void;
}

const Users: Component<UsersProps> = (props) =>{
    const { state, openPanel } = useAccountsContext();

    const add = () => openPanel("Create User");

    return (
        <div style={{ width: "100%" }}>
            <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", padding: "2rem 1rem" }}>
                <h1 style={{ "font-weight": "300" }}>Users</h1>
                <span class={"clicakble"} title="Create User" style={{ opacity: 0.8 }} onClick={add}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 30 26">
                        <path fill="currentColor" d="M10.5.156c-3.017 0-5.438 2.072-5.438 6.032c0 2.586 1.03 5.22 2.594 6.843c.61 1.623-.49 2.227-.718 2.313C3.781 16.502.093 18.602.093 20.688v.78c0 2.843 5.414 3.5 10.437 3.5a46 46 0 0 0 3.281-.124a7.75 7.75 0 0 1-2.124-5.344c0-1.791.61-3.432 1.624-4.75c-.15-.352-.21-.907.063-1.75c1.555-1.625 2.563-4.236 2.563-6.813c0-3.959-2.424-6.03-5.438-6.03zm9 13.031a6.312 6.312 0 1 0 0 12.625a6.312 6.312 0 0 0 0-12.625M18.625 16h1.75v2.594h2.594v1.812h-2.594V23h-1.75v-2.594H16v-1.812h2.625z"/>
                    </svg>
                </span>
            </div>
            <Show when={!state().loading} fallback={<LoadingUsers />}>
                <Show when={state().users.length > 0} fallback={<NoUsers />}>
                    <div class={"users-container"}>
                        <For each={state().users}>
                            {(item) => (<UserView user={item} edit={()=> props.edit(item)}/>)}
                        </For>
                    </div>
                </Show>
            </Show>
        </div>
    );
}

export default Users;