import { onMount, type Component } from "solid-js";

interface LoadingProps{
    message?: string
}

const Loading: Component<LoadingProps> = ({ message }) =>{
    return (
        <div class="loading">
            <canvas id="dotLottie-canvas"></canvas>
            <div>{message ?? "Laoding, please wait..."}</div>
        </div>
    );
}

export default Loading;