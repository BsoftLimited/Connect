import { JSX, Show, type Component } from "solid-js";
import InputError from "./input-error";

interface FormInputProps{
    label: string; 
    type: string, 
    placeholder: string; 
    name: string; 
    error?: string;
    value?: string;
    valueChange?: (value: string) =>void;
}

const FormInput: Component<FormInputProps> = (props) => {
    const onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        if(props.valueChange){
            event.preventDefault();
            props.valueChange(event.currentTarget.value);
        }
    }

    return (
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
            <label for={props.name}>{props.label}</label>
            <input id={props.name} name={props.name} type={props.type} value={props.value ?? ""} placeholder={props.placeholder} onChange={onChange} style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid", "border-color": (props.error ? "red" : "#ccc"), width: "100%" }}/>
            <Show when={props.error}>
                <InputError message={props.error} />
            </Show>
        </div>
    );
}

export default FormInput;