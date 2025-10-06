import { createSignal, Show, type Component } from "solid-js";
import { PopUp} from "../components/pop-up";
import type { User } from "../../common";
import PopUpConfirm from "../components/popup-confirm";
import { request, type RequestFailed } from "../../utils/util";
import InputError from "../components/input-error";

interface DeleteUserProps{
    user: User
    done: () =>void
    cancel: () => void
}

interface DeleteUserState{
    loading: boolean,
    errorMessage?: string,
}

const DeleteUser: Component<DeleteUserProps> = (props) =>{
    const [state, setState] = createSignal<DeleteUserState>({ loading: false });

    const deleteUser = async () =>{
        setState({ loading: true });
        try{
            await request({ url: `/api/user/`, method: "DELETE", input: { id: props.user.id } });
            
            alert("User deleted successfully");
            props.done();
        }catch(error){
            console.error("Failed to delete user", error);
            const failed = error as RequestFailed;
            alert(`Failed to delete user: ${failed.error.message}`);
            setState((init)=> { return { ...init, loading: false, errorMessage: failed.error.message } });
        }
    }

    return (
        <PopUp>
            <div style={{ display: "flex", "flex-direction": "column", "align-items": "center" }}>
                <Show when={!state().loading}>
                    <div style={{ "font-size": "16px", "font-weight": "lighter" }}>Are you sure you want to delete the user <strong>{props.user.username}</strong>? This action cannot be undone.</div>
                    <PopUpConfirm cancel={props.cancel} proceed={deleteUser} failed={state().errorMessage !== undefined}/>
                    <Show when={state().errorMessage}>
                        <div style={{ width: "100%" }}>
                            <InputError message={state().errorMessage}/>
                        </div>
                    </Show>
                </Show>
                <Show when={state().loading}>
                    <div style={{ "font-size": "16px", "font-weight": "lighter" }}>Deleting user: {props.user.username}, please wait...</div>
                    <progress />
                </Show>
            </div>
        </PopUp>
    );
}

export default DeleteUser;