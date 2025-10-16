import { createSignal, JSX, Show, type Component } from "solid-js";
import { useUserContext } from "../providers/user";
import { useSystem } from "../providers/system";
import InputError from "./input-error";
import IOSSwitch from "./ios-switch";
import SubmitButton from "./submit-button";


interface SettingToggleProps{
    label: string,
    checked: boolean,
    error?: string,
    onChange: (checked: boolean) => void
}

const SettingToggle: Component<SettingToggleProps> = (props) =>{
    return (
        <div style={{ display: "flex", "flex-direction": "column", "max-width": "100%", gap: "4px", "background-color": "white", "border-radius": "4px", padding: "1rem" }}>
            <div style={{ display: "flex", "flex-direction": "row", "align-items": "center", width: "100%", "justify-content": "space-between" }}>
                <label style={{ "font-size": "16px", "font-weight": "300" }} for="access-level">{props.label}</label>
                <IOSSwitch name="allow-guest-download" label="allow-guest-download" checked={props.checked} onChange={props.onChange} size="small"/>
            </div>
            <InputError message={props.error} />
        </div>
    );
}

const SystemSettings = () =>{
    const { systemState, updateConfig } = useSystem();

    const [state, setState] = createSignal({ ...systemState().data!, edited: false });
    const [loading, setLoading] = createSignal(false);

    const handleAllowGuestDownload = (value: boolean) => setState((init)=>{
        return {...init, edited: true, allowGuestDownload: value}
    });

    const handleAllowGuestSignup = (value: boolean) => setState((init)=>{
        return {...init, edited: true, allowGuestSignup: value}
    });

    const handleMaintenanceMode = (value: boolean) => setState((init)=>{
        return {...init, edited: true, maintenanceMode: value}
    });

    const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        setLoading(true);
        updateConfig(state()).then(()=> {
            setState((init)=>{
                return {...init, edited: false}
            });
        }).finally(()=>setLoading(false));
    }

    return (
        <>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>System Settings</h1>
            <form onSubmit={submit} style={{ "padding": "1rem 2rem", display: "flex", "flex-direction": "column", width: "100%", gap: "0.6rem" }}>
                <SettingToggle checked={state().allowGuestDownload} label="Allow Guest Download" onChange={handleAllowGuestDownload}/>
                <SettingToggle checked={state().allowGuestSignup} label="Allow Guest Sign Up" onChange={handleAllowGuestSignup}/>
                <SettingToggle checked={state().maintenanceMode} label="Maintainance Mode" onChange={handleMaintenanceMode}/>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "end", width: "100%" }}>
                    <SubmitButton label={ loading() ? "Saving" : "Save Changes" } enabled={ state().edited && !loading() } width="110px" borderRadius="4px" />
                </div>
            </form>
        </>
    );
}

const UserSettings = () =>{
    const { sessionState, updateConfig } = useUserContext();
    const [state, setState] = createSignal({ ...sessionState().data?.config!, edited: false });
    const [loading, setLoading] = createSignal(false);

    const handleImagePreview = (value: boolean) => setState((init)=>{
        return {...init, edited: true, imagePreview: value}
    });

    const handleNotifications = (value: boolean) => setState((init)=>{
        return {...init, edited: true, notifications: value}
    });

     const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        setLoading(true);
        updateConfig(state()).then(()=> {
            setState((init)=>{
                return {...init, edited: false}
            });
        }).finally(()=>setLoading(false));
    }

    return (
        <>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>User Settings</h1>
            <form onSubmit={submit} style={{ "padding": "1rem 2rem", display: "flex", "flex-direction": "column", width: "100%", gap: "0.6rem" }}>
                <SettingToggle checked={state().imagePreview} label="Image Preview" onChange={handleImagePreview}/>
                <SettingToggle checked={state().notifications} label="Notifications" onChange={handleNotifications}/>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "end", width: "100%" }}>
                    <SubmitButton label={ loading() ? "Saving" : "Save Changes" } enabled={state().edited && !loading()} width="110px" borderRadius="4px"/>
                </div>
            </form>
        </>
    );
}

const Settings = () =>{
    const { sessionState } = useUserContext();

    return (
        <div style={{ width: "100%" }}>
            <UserSettings />
            <Show when={sessionState().data?.user.role === "admin"}>
                <SystemSettings />
            </Show>
        </div>
    );
}

export default Settings;