import { createSignal, JSX, Show, type Component } from "solid-js";

interface RequestButtonProps {
    text: string;
    class?: string;
    style?: JSX.CSSProperties;
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
        <button class={props.class}style={props.style} type="button" onClick={clicked} disabled={props.disabled || loading()}>
            <Show when={loading()} fallback={<span>{props.text}</span>}>
                {props.loadingText}<span class="spinner" style={{ "margin-left": "8px" }}></span>
            </Show>
        </button>
    );
}

export default RequestButton;