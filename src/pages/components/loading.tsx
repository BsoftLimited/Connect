import { onMount, type Component } from "solid-js";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface LoadingProps{
    message?: string
}

const Loading: Component<LoadingProps> = ({ message }) =>{
    onMount(()=>{
        const canvas = document.getElementById("dotLottie-canvas");
        if(canvas){
            const dotLottie = new DotLottie({
                canvas:  canvas as HTMLCanvasElement,
                src: "/assets/animations/OuJ0EckoJ8.lottie",
                //src: "/assets/animations/offy4sIZvp.lottie",
                loop: true,
                autoplay: true
            });
        }
    });

    return (
        <div class="loading">
            <canvas id="dotLottie-canvas"></canvas>
            <div>{message ?? "Laoding, please wait..."}</div>
        </div>
    );
}

export default Loading;