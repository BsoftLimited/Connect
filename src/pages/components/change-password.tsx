import type { Component } from "solid-js";
import { useAccountsContext } from "../providers/accounts";

interface ChangePasswordProps{
    
}

const ChangePassword: Component<ChangePasswordProps> = (props) => {
    const { closePanel } = useAccountsContext();
    
    return (
        <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", width: "100%", height: "100%", overflow: "auto" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Change Password</h1>
            <div style={{ width: "28rem", display: "flex", "flex-direction": "column", gap: "1rem", padding: "1rem" }}>
                <form>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="current-password">Current Password</label>
                            <input id="current-password" type="password" placeholder="Enter your current password" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width: "100%" }}/>
                        </div>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="new-password">New Password</label>
                            <input id="new-password" type="password" placeholder="Enter your new password" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}/>
                        </div>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                            <label for="confirm-password">Confirm New Password</label>
                            <input id="confirm-password" type="password" placeholder="Confirm your new password" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}/>
                        </div>
                        <button type="submit" style={{ padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;