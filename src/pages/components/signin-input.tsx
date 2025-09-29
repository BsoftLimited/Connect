import { JSX, Show, type Component, type ParentComponent } from "solid-js";
import InputError from "./input-error";

interface SigninInputProps{
    label: string; 
    type: string, 
    placeholder: string; 
    name: string; 
    error?: string;
    value?: string;
    valueChange?: (value: string) =>void;
}

const SigninInput: ParentComponent<SigninInputProps> = (props) => {
    const onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (event) =>{
        if(props.valueChange){
            event.preventDefault();
            props.valueChange(event.currentTarget.value);
        }
    }
    
    return (
        <div>
            <label for={props.name}>{props.label}</label>
            <div class="input-field" style={{ border: props.error ? "1px solid #f16c6cff" : "1px solid #ccc" }}>
                <span>{props.children}</span>
                <input type={props.type} id={props.name} name={props.name} placeholder={props.placeholder} value={props.value ?? ""} onChange={onChange}/>
            </div>
            <Show when={props.error}>
                <InputError message={props.error} />
            </Show>
        </div>
    );
}

export default SigninInput;