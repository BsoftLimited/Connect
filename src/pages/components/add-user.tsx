import type { Component } from "solid-js";

interface AddUserProps {
    close: ()=> void
}

const AddUser: Component<AddUserProps> = (props) => {
    return (
        <div style={{ display: "flex", "flex-direction": "column", width: "100%", height: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Add User</h1>
            <div style={{ width: "28rem", display: "flex", "flex-direction": "column", gap: "1rem", padding: "1rem" }}>
                <form>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="name">Name</label>
                            <input id="name" type="text" placeholder="Enter user's name" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width: "100%" }}/>
                        </div>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="email">Email</label>
                            <input id="email" type="email" placeholder="Enter user's email" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}/>
                        </div>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="access-level">Access Level</label>
                            <select id="access-level" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}>
                                <option value="read-only">Read Only</option>
                                <option value="read-write">Read Write</option>
                            </select>
                        </div>
                        <button type="submit" style={{ padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Add User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;