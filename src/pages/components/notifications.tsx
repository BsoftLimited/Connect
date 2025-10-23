import { For, on, type Component } from "solid-js";
import { useUserContext } from "../providers/user";
import type { Notification } from "../../common";
import { request } from "../../utils/util";

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

const NoNotifiaction = (props: { notification: Notification }) =>{
    const { sessionState } = useUserContext();
    
    // on mount, send a request to mark the notification as read
    on(() => props.notification, async () => {
        try{
            const result = await request({ url: `/api/notifications/${props.notification.id}`, method: "PATCH", input: { seen: true } });
            if(result.first){
                
            }else{
                const response = result.second;
                console.error(`Failed to mark notification as seen: ${response.error.message}`);
            }
        }catch(err){
            console.error(`Failed to mark notification as seen: ${err}`);
        }
    });

    return (
        <div style={{ padding: "1rem", "border-bottom": "solid 1px var(--md-sys-color-outline-variant)" }}>
            <div style={{ display: "flex", "flex-direction": "row", gap: "0.5rem", "align-items": "center" }}>
                {props.notification.ntype === "info" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                )}
                {props.notification.ntype === "important" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
                {props.notification.ntype === "error" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                )}
                <div style={{ "font-weight": "500", "font-size": "16px" }}>{props.notification.message}</div>
            </div>
            <div style={{ "font-size": "12px", color: "gray", "margin-top": "0.5rem" }}>{new Date(props.notification.createdAt).toLocaleString()}</div>
        </div>
    );
}


const Notifiactions = () =>{
    const { sessionState } = useUserContext();

    return (
        <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
            <For each={sessionState().data?.notifications} fallback={<NoNotifiactions />}>
                {(item, index) => (
                    <NoNotifiaction notification={item} />
                )}
            </For>
        </div>
    );
}

export default Notifiactions;