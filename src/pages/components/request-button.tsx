import { createSignal, type Component } from "solid-js";

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
        <button class={props.class} onClick={clicked} disabled={props.disabled || loading()}>
            {loading() ? props.loadingText : props.text}
        </button>
    );
}

export default RequestButton;