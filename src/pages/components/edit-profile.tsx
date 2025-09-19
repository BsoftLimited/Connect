import { createSignal, JSX, type Component } from "solid-js";
import { useAccountsContext } from "../providers/accounts";
import { useUserContext } from "../providers/user";
import FormInput from "./form-input";

interface EditProfileProps{
    
}

const EditProfile: Component<EditProfileProps> = (props) =>{
    const { closePanel, updateProfile } = useAccountsContext();
    const { userState } = useUserContext();

    const [data, setData] = createSignal({ username: userState().user?.username!, email: userState().user?.email! });
    const [formErrors, setFormErrors] = createSignal<{ username?: string, email?: string }>({});

    const updateEmail = (email: string) => setData(init => { 
        return {...init, email};
    });

    const updateUsername = (username: string) => setData(init => { 
        return {...init, username};
    });

    const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        //validate form
        const errors: { username?: string, email?: string } = {};
        if(!data().username || data().username.trim().length < 3){
            errors.username = "username is required and should be at least 3 characters";
        }

        if(!data().email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data().email)){
            errors.email = "a valid email is required";
        }

        setFormErrors(errors);
        if(Object.keys(errors).length > 0){
            return;
        }

        updateProfile(data()).then(()=>{
            closePanel();
        });
    }
    
    return (
        <form onSubmit={submit} style={{ padding: "1rem", height: "100%" }}>
            <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", height: "100%" }}>
                <h1 style={{ "padding-bottom": "2rem", "font-weight": "300" }}>Edit Profile</h1>
                <FormInput label="Username" type="text" valueChange={updateUsername} name="username" error={formErrors().username}  placeholder="Enter new username" value={data().username} />
                <FormInput label="Email" type="email" valueChange={updateEmail} name="email" error={formErrors().email} placeholder="Enter new email address" value={data().email} />
                <div style={{ flex: 1, display: "flex", "flex-direction": "column-reverse" }}>
                    <button type="submit" style={{ "justify-items": "end", padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Save Changes</button>
                </div>
            </div>
        </form>
    );
}

export default EditProfile;