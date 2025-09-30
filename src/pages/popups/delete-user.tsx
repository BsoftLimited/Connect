import type { Component } from "solid-js";
import { PopUp} from "../components/pop-up";
import type { User } from "../../common";

interface DeleteUserProps{
    user: User
    proceed: (user: User) =>void
    cancel: () => void
}

const DeleteUser: Component<DeleteUserProps> = (props) =>{
    return (
        <PopUp>
            <div style={{ display: "flex", "flex-direction": "column" }}>
                <div>Are you sure you want to delete user: {props.user.username}</div>
                <div style={{ display: "flex", "flex-direction": "row", gap: "2rem" }}>
                    <button>Cancel</button>
                    <button>Proceed</button>
                </div>
            </div>
        </PopUp>
    );
}

export default DeleteUser;