import { onMount } from "solid-js";
import { DotLottie } from "@lottiefiles/dotlottie-web";

const Loading = () =>{
    onMount(()=>{
        const canvas = document.getElementById("dotLottie-canvas");
        if(canvas){
            const dotLottie = new DotLottie({
                canvas:  canvas as HTMLCanvasElement,
                //src: "/assets/animations/OuJ0EckoJ8.lottie",
                src: "/assets/animations/offy4sIZvp.lottie",
                loop: true,
                autoplay: true
            });
        }
    });

    return (
        <div class="loading">
            <canvas id="dotLottie-canvas"></canvas>
        </div>
    );
}

export default Loading;