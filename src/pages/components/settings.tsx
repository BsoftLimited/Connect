import { Show, type Component } from "solid-js";
import { useUserContext } from "../providers/user";
import { useSystem } from "../providers/system";
import InputError from "./input-error";
import IOSSwitch from "./ios-switch";
import SubmitButton from "./submit-button";


interface SettingToggleProps{
    label: string,
    checked: boolean
}

const SettingToggle: Component<SettingToggleProps> = (props) =>{
    return (
        <div style={{ display: "flex", "flex-direction": "column", "max-width": "100%", gap: "4px" }}>
            <div style={{ display: "flex", "flex-direction": "row", "align-items": "center", width: "100%", "justify-content": "space-between", "background-color": "white", "border-radius": "10px", padding: "1rem" }}>
                <label style={{ "font-size": "16px", "font-weight": "300" }} for="access-level">{props.label}</label>
                <IOSSwitch name="allow-guest-download" label="allow-guest-download" checked={props.checked}/>
            </div>
            <Show when={false}>
                <InputError message={undefined} />
            </Show>
        </div>
    );
}

const Settings = () =>{
    const { sessionState } = useUserContext();
    const { systemState } = useSystem();

    return (
        <div style={{ width: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>User Settings</h1>
            <form style={{ "padding": "1rem 2rem", display: "flex", "flex-direction": "column", width: "100%", gap: "0.6rem" }}>
                <SettingToggle checked={sessionState().data?.config.imagePreview ?? false} label="Image Preview"/>
                <SettingToggle checked={sessionState().data?.config.notifications ?? false} label="Notifications"/>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "end", width: "100%" }}>
                    <SubmitButton label="Save Changes" enabled={false} width="110px" borderRadius="10px"/>
                </div>
            </form>
            <Show when={sessionState().data?.user.role === "admin"}>
                <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>System Settings</h1>
                <form style={{ "padding": "1rem 2rem", display: "flex", "flex-direction": "column", width: "100%", gap: "0.6rem" }}>
                    <SettingToggle checked={systemState().data?.allowGuestDownload ?? false} label="Allow Guest Download"/>
                    <SettingToggle checked={systemState().data?.allowGuestSignup ?? false} label="Allow Guest Sign Up"/>
                    <SettingToggle checked={systemState().data?.maintenanceMode ?? false} label="Maintainance Mode"/>
                    <div style={{ display: "flex", "flex-direction": "row", "justify-content": "end", width: "100%" }}>
                        <SubmitButton label="Save Changes" enabled={true} width="110px" borderRadius="10px"/>
                    </div>
                </form>
            </Show>
        </div>
    );
}

export default Settings;