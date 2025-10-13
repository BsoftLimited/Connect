import type { Component } from "solid-js";

interface SubmitButtonProps{
    enabled?: boolean,
    width?: string,
    label: string,
    borderRadius?: string
}

const SubmitButton: Component<SubmitButtonProps> = (props) =>{
    const background = () => props.enabled ? "#4CAF50" : "rgba(170, 170, 170, 0.5)";
    const cursor = () =>props.enabled ? "pointer" : "default";
    const width = props.width ?? "100%";
    const borderRadius = props.borderRadius ?? "4px";
    
    return (
        <button type="submit" disabled={!props.enabled} style={{ "justify-items": "end", width, padding: "0.7rem", "border-radius": borderRadius, border: "none", background: background(), color: "white", cursor: cursor()}}>
            { props.label }
        </button>
    );
}

export default SubmitButton;