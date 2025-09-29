import { Show, type ParentComponent } from "solid-js";
import { useUserContext } from "../providers/user";

interface ProfileDetailProps{
    label: string,
    value?: string,
    edith?: CallableFunction
}

const ProfileDetail: ParentComponent<ProfileDetailProps> = (props) =>{
    const { sessionState } = useUserContext();

    const edith = () =>{
        if(props.edith){
            props.edith();
        }
    }

    return (
        <div style={{ width: "100%", display: "flex", "flex-direction": "row", gap: "8px", "align-items": props.value ? "start" : "center", "padding": "0.7rem 1rem" }}>
            {props.children}
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", width: "100%" }}>
                    <div style={{ display: "flex", "flex-direction": "row", gap: "4px", "align-items": "center", "font-weight": "300", "font-size": "16px" }}>
                        { props.label }
                    </div>
                    <Show when={props.edith && sessionState().data?.user.role !== "admin"}>
                        <span class={"clicakble"} onClick={edith}>Edit</span>
                    </Show>
                </div>
                <Show when={props.value}>
                    <div style={{ "margin-top": "4px", "font-weight": "600" }}>{ props.value }</div>
                </Show>
            </div>
        </div>
    );
}

export default ProfileDetail;