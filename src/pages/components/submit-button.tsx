import type { Component } from "solid-js";

interface SubmitButtonProps{
    enabled?: boolean,
    label: string 
}

const SubmitButton: Component<SubmitButtonProps> = (props) =>{
    const background = () => props.enabled ? "#4CAF50" : "rgba(170, 170, 170, 0.5)";
    const cursor = () =>props.enabled ? "pointer" : "default"
    
    return (
        <button type="submit" disabled={!props.enabled} style={{ "justify-items": "end", padding: "0.7rem", "border-radius": "4px", border: "none", background: background(), color: "white", cursor: cursor()}}>
            { props.label }
        </button>
    );
}

export default SubmitButton;