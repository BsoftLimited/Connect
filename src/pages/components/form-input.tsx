import { Show } from "solid-js";
import InputError from "./input-error";

const FormInput = (props: { label: string; type: string, placeholder: string; name: string; error?: string }) => {
    return (
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
            <label for={props.name}>{props.label}</label>
            <input id={props.name} name={props.name} type={props.type} placeholder={props.placeholder} style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid", "border-color": (props.error ? "red" : "#ccc"), width: "100%" }}/>
            <Show when={props.error}>
                <InputError message={props.error} />
            </Show>
        </div>
    );
}

export default FormInput;