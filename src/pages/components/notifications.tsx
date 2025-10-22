import { For, type Component } from "solid-js";
import { useUserContext } from "../providers/user";

const NoNotifiactions = () =>{
    return (
        <div style={{ display: "flex", "align-items": "center", "justify-content": "center", "flex-direction": "column", width: "100%", height: "100%", color: "gray" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 22h2"/>
                    <circle cx="12" cy="3" r="1"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 19v-9c0-1.144.32-2.214.876-3.124M6 19h12M6 19H4m14 0v-1m0 1h1M9.999 4.342A6 6 0 0 1 18 10v2.343"/>
                    <path stroke-linecap="round" d="m4 4l16 16"/>
                </g>
            </svg>
            <div style={{ "font-size": "20px", "font-weight": "300", "letter-spacing": "1.5" }}>No Notifications yet</div>
        </div>
    );
}


const Notifiactions = () =>{
    const { sessionState } = useUserContext();

    return (
        <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
            <For each={sessionState().data?.notifications} fallback={<NoNotifiactions />}>
                {(item, index) => (
                    <div>{ item.message }</div>
                )}
            </For>
        </div>
    );
}

export default Notifiactions;