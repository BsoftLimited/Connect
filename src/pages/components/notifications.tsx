import { Motion } from "@motionone/solid";
import type { Component } from "solid-js";

interface NotifiactionsProps{
    open: boolean,
    onClocse: ()=> void
}

const Notifiactions: Component<NotifiactionsProps> = (props) =>{
    return (
        <Motion.div initial={{ x: "100%" }} animate={{ x: props.open ? 0 : "100%" }} transition={{ duration: 0.3, easing: "ease-out" }} class="panel">
            <div style={{ display: 'flex', "flex-direction": "column", height: "100%", width: "100%" }}>
                <div class="panel-title" style={{ display: "flex", width: "100%", "align-items": "center", "flex-direction": "row" }}>
                    <div onClick={props.onClocse} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path stroke-width="1" fill="currentColor" d="M9.193 9.249a.75.75 0 0 1 1.059-.056l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.004-1.115l1.048-.942H6.75a.75.75 0 1 1 0-1.5h3.546l-1.048-.942a.75.75 0 0 1-.055-1.06M22 17.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75zm-2.75 1.25c.69 0 1.25-.56 1.25-1.25V6.749c0-.69-.56-1.25-1.25-1.25h-3.254V18.5zm-4.754 0v-13H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25z"/></svg>
                    </div>
                    <h3 style={{ flex: 1, "text-align": "center" }}>Notifiactions</h3>
                </div>
            </div>
        </Motion.div>
    );
}

export default Notifiactions;