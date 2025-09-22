import { createSignal, type Component } from "solid-js";
import { useUserContext } from "../providers/user";
import { useAccountsContext } from "../providers/accounts";
import type { User } from "../../common";

const DeleteUser: Component<{ user: User }> = (props) =>{
    const { sessionState } = useUserContext();
    const [loading, setLoading] = createSignal(false);
    const { state, closePanel, deleteUser } = useAccountsContext();

    const del = () =>{
        setLoading(true);
        deleteUser(props.user.id).then(()=>{
            closePanel();
        }).catch((err)=>{
            console.error(err);
            alert(`Failed to delete user: ${err}`);
        }).finally(()=>{
            setLoading(false);
        });
    }

    
    return (
        <div style={{ width: "100%", display: "flex", "flex-direction": "column", gap: "1rem", padding: "1rem 2rem" }}>
            <h2 style={{ "font-weight": "300" }}>Delete User</h2>
            <p>Are you sure you want to delete the user <strong>{props.user.username}</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", "flex-direction": "row", gap: "1rem" }}>
                <button class={"btn"} style={{ "background-color": "#ccc", color: "#000" }} onClick={closePanel} disabled={loading()}>Cancel</button>
                <button class={"btn"} style={{ "background-color": "#e74c3c", color: "#fff" }} onClick={del} disabled={loading()}>{loading() ? "Deleting..." : "Delete"}</button>
            </div>
        </div>
    );
}

export default DeleteUser;