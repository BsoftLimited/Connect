import { createSignal, Show, type JSX } from "solid-js";
import { useAccountsContext, type CreateUserFailedResult } from "../providers/accounts";
import type { CreateUserData } from "../../common";
import FormInput from "./form-input";
import { isFormValid } from "../../utils/util";
import InputError from "./input-error";

const AddUser = () => {
    const { createUser } = useAccountsContext();
    const [formErrors, setFormErrors] = createSignal<CreateUserFailedResult>({});
    const [role, setRole] = createSignal<"guest" | "user">("guest");

    const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const request: CreateUserData = {
            username: data.get("username")?.toString()!,
            email: data.get("email")?.toString()!,
            role: data.get("role")?.toString() as "guest" | "user",
            accessLevel: data.get("access-level") as "read-only" | "read-write",
        }

        const errors = isFormValid(request, false);
        if(Object.keys(errors).length > 0){
            setFormErrors({ error: errors });
            return;
        }

        createUser(request).then((result)=> setFormErrors(result));
    }

    const onRoleChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (event) =>{
        const value = event.currentTarget.value;
        setRole(value as "guest" | "user");
    }
    
    return (
        <div style={{ display: "flex", "flex-direction": "column", width: "100%", height: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Add User</h1>
            <div style={{ width: "100%",  height: "100%", display: "flex", "flex-direction": "column", gap: "1rem", padding: "1rem" }}>
                <form onSubmit={submit} style={{ display: "flex", height: "100%", "flex-direction": "column", gap: "1rem" }}>
                    <FormInput label="Username" type="text" placeholder="Enter username" name="username" error={formErrors().error?.username} />
                    <FormInput label="Email" type="email" placeholder="Enter email" name="email" error={formErrors().error?.email} />
                    <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                        <label for="role">Role</label>
                        <select id="role" name="role" onChange={onRoleChange} style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}>
                            <option value="guest">Guest</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                        <label for="access-level">Access Level</label>
                        <select id="access-level" name="access-level" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}>
                            <option value="read-only">Read Only</option>
                            <option value="read-write" disabled={role() === "guest"}>Read & Write</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, display: "flex", "flex-direction": "column-reverse" }}>
                        <button type="submit" style={{ padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Add User</button>
                        <Show when={formErrors().message}>
                            <InputError message={formErrors()?.message} />
                        </Show>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;