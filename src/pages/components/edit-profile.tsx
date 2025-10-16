import { createSignal, JSX, type Component } from "solid-js";
import { useAccountsContext } from "../providers/accounts";
import { useUserContext } from "../providers/user";
import FormInput from "./form-input";
import { isEmailValid, isUsernameValid } from "../../utils/util";
import type { UpdateProfileData } from "../../common";
import InputError from "./input-error";

const EditProfile: Component = () =>{
    const { updateProfile } = useAccountsContext();
    const { sessionState } = useUserContext();

    const [data, setData] = createSignal({ username: sessionState().data?.user.username!, email: sessionState().data?.user.email! });
    const [formErrors, setFormErrors] = createSignal<UpdateProfileData & { message?: string }>({});

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
        if(!isUsernameValid(data().username)){
            errors.username = "username is required and should be at least 3 characters";
        }

        if(!isEmailValid(data().email)){
            errors.email = "a valid email is required";
        }

        if(Object.keys(errors).length > 0){
            setFormErrors(errors);
            return;
        }

        updateProfile(data()).then(errors =>{
            setFormErrors({...(errors.error ?? {}), message: errors.message});
        });
    }
    
    return (
        <form onSubmit={submit} style={{ padding: "1rem", height: "100%" }}>
            <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", height: "100%" }}>
                <h1 style={{ "padding-bottom": "2rem", "font-weight": "300" }}>Edit Profile</h1>
                <FormInput label="Username" type="text" valueChange={updateUsername} name="username" error={formErrors().username}  placeholder="Enter new username" value={data().username} />
                <FormInput label="Email" type="email" valueChange={updateEmail} name="email" error={formErrors().email} placeholder="Enter new email address" value={data().email} />
                <InputError message={formErrors().message}/>
                <div style={{ flex: 1, display: "flex", "flex-direction": "column-reverse" }}>
                    <button type="submit" style={{ "justify-items": "end", padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Save Changes</button>
                </div>
            </div>
        </form>
    );
}

export default EditProfile;