import { createSignal, Show, type Component } from "solid-js";

interface RequestButtonProps {
    text: string;
    class: string;
    loadingText: string;
    disabled?: boolean;
    request: () => Promise<void>; 
}

const RequestButton: Component<RequestButtonProps> = (props) => {
    const [loading, setLoading] = createSignal(false);
    
    const clicked = () => {
        if (props.disabled) return;

        setLoading(true);
        props.request().finally(() => {
            setLoading(false);
        });
    }
    
    return (
        <button class={props.class} type="submit" onClick={clicked} disabled={props.disabled || loading()}>
            {loading() ? props.loadingText : props.text}
            <Show when={loading()} fallback={<span>{props.text}</span>}>
                <span class="spinner" style={{ "margin-left": "8px" }}></span>
            </Show>
        </button>
    );
}

export default RequestButton;