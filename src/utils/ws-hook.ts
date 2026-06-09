import { createSignal, onMount } from "solid-js";

import type { Notification } from "../common";

export type SocketMessage = { message?: string, operation: string, progress?: any, completed?: boolean, notification?: Notification, status: number }
export type MessageCallback = (message: SocketMessage)=>void;

const useWS = (path:string) =>{
    const [ws, setWS] = createSignal<WebSocket>();
    const [messageListener, setMessageListener] = createSignal<MessageCallback>();

    const connect = () =>{
        if(ws() === undefined || !ws()?.OPEN){
            const init = new WebSocket(path)

            init.onopen = () => {
                console.log('Connected to server')
                setWS(init);
            }

            init.onmessage = (event) => {
                console.log(`what is comming from server: ${event.data}`);
                const message = JSON.parse(event.data) as SocketMessage;
                if(message){
                    const init = messageListener();
                    if(init){
                        init(message);
                    }
                }
            }

            init.onclose = () => {
                console.log('WS Connection closed');
                setWS();
            }
            init.onerror = (event) => console.error(event);
            return init;
        }
        return ws();
    }

    onMount(connect);

    return {
        connected: ws() !== undefined,
        setMessageListener: (listener: MessageCallback) => setMessageListener((_)=> listener),
        send: (operation: string, data: any) =>{
            connect()?.send(JSON.stringify({ operation,  data }));
        },
    };
}

export default useWS;