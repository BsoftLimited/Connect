import type { Component } from "solid-js";

interface EditProfileProps{
    close: ()=> void
}

const EditProfile: Component<EditProfileProps> = (props) =>{
    return (
        <div style={{ padding: "1rem" }}>
            <form>
                <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                        <label for="name">Name</label>
                        <input id="name" type="text" placeholder="Enter your name" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width: "100%" }}/>
                    </div>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                        <label for="email">Email</label>
                        <input id="email" type="email" placeholder="Enter your email" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}/>
                    </div>
                    <button type="submit" style={{ padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Save Changes</button>
                </div>
            </form>
        </div>
    );
}

export default EditProfile;