import { createContext, createSignal, onMount, useContext, type ParentComponent } from "solid-js";
import type { Notification } from "../../common";

export type SocketMessage = { message?: string, operation: string, progress?: any, completed?: boolean, notification?: Notification, status: number }
export type NotificationCallback = (notification: Notification)=>void;
export type MessageCallback = (message: SocketMessage)=>void;

interface WSContextType{
    connected: boolean
    setMessageListener: (messageListener: MessageCallback) => void
    setNotificationListener: (notificationListener: NotificationCallback) => void

    send: (operation: string, data: any) => void
}

const WSContext = createContext<WSContextType>();

export const WSContextProvider: ParentComponent = (props) =>{
    const [ws, setWS] = createSignal<WebSocket>();
    const [notificationListener, setNotificationListener] = createSignal<NotificationCallback>();
    const [messageListener, setMessageListener] = createSignal<MessageCallback>();

    const connect = () =>{
        if(ws() === undefined || !ws()?.OPEN){
            const init = new WebSocket('/api/process')

            init.onopen = () => {
                console.log('Connected to server')
                setWS(init);
            }

            init.onmessage = (event) => {
                console.log(`what is comming from server: ${event.data}`);
                const message = JSON.parse(event.data) as SocketMessage;
                if(message){
                    if(message.operation === "notification"){
                        const init = notificationListener();
                        if(init){
                            init(message.notification!);
                        }
                    }else{
                        const init = messageListener();
                        if(init){
                            init(message);
                        }
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

    const wsContextType: WSContextType = {
        connected: ws() !== undefined,
        setNotificationListener,
        setMessageListener,
        send(operation, data) {
            connect()?.send(JSON.stringify({ operation,  data }));
        },
    };

    onMount(connect);

    return (
        <WSContext.Provider value={wsContextType}>
            {props.children}
        </WSContext.Provider>
    );
}

export const useWSContext = () => {
    const context = useContext(WSContext);
    if (!context) {
        console.log(JSON.stringify(context));
        throw new Error("useWSContext must be used within an WSContextProvider");
    }
    return context;
}