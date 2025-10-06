import type { Component } from "solid-js";

interface PopUpConfirmProps{
    cancel?: ()=> void,
    proceed?: () => void
    failed?: boolean
}

const PopUpConfirm: Component<PopUpConfirmProps> = (props) =>{
    const confirmLabel = () => props.failed ? "Retry" : "Proceed";

    return (
        <div style={{ display: "flex", "flex-direction": "row", gap: "1.5rem" }}>
            <button onClick={props.cancel} style={{ border: "solid 2px var(--md-sys-color-primary)", color: "var(--md-sys-color-primary)", "border-radius": "10px", width: "120px", height: "40px", background: "transparent" }}>Cancel</button>
            <button onClick={props.proceed} style={{ border: "solid 2px var(--md-sys-color-primary)", "border-radius": "10px", width: "120px", height: "40px", background: "var(--md-sys-color-primary)" }}>{confirmLabel()}</button>
        </div>
    );
}

export default PopUpConfirm;