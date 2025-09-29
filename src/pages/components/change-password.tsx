import { createSignal, Show, type JSX } from "solid-js";
import { useAccountsContext } from "../providers/accounts";
import type { ChangePasswordForm } from "../../common";
import FormInput from "./form-input";
import { isPassowrdValid, request, type RequestFailed } from "../../utils/util";
import InputError from "./input-error";

const ChangePassword = () => {
    const { closePanel } = useAccountsContext();
    const [errors, setErrors] = createSignal<{ message?: string, error?: Partial<ChangePasswordForm> }>({});

    const submitRequest = async(data: ChangePasswordForm) =>{
        try{
            await request({ url: "/user/password", input: data, method: "PATCH"});
            alert("password changed successfully");
            closePanel();
        }catch(error){
            console.log(error);
            const response = error as RequestFailed;
            if(response.status === 400){
                setErrors(response.error);
            }else{
                console.error(response);
                setErrors({ message: "An error occurred. Please try again." });
            }
        }
    }

    const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const data: ChangePasswordForm = {
            oldPassword: formData.get("old-password")?.toString() ?? "",
            newPassword: formData.get("new-password")?.toString() ?? "",
            confirmPassword: formData.get("confirm-password")?.toString() ?? ""
        }

        const init: Partial<ChangePasswordForm> = {}
        if(!isPassowrdValid(data.oldPassword)){
            init.oldPassword = "Password provided is invalid, confirm and try again";
        }

        if(!isPassowrdValid(data.newPassword)){
            init.newPassword = "New passowrd must be atleast 6 characters"
        }

        if(data.newPassword !== data.confirmPassword){
            init.confirmPassword = "Password mismatch, confirm and try again";
        }

        if(Object.keys(init).length > 0){
            setErrors({ error: init });
            return;
        }

        submitRequest(data);
    }
    
    return (
        <div style={{ display: "flex", "flex-direction": "column", width: "100%", height: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Change Password</h1>
            <div style={{ width: "100%", display: "flex", "flex-direction": "column", flex: 1, gap: "1rem", padding: "1rem" }}>
                <form onSubmit={submit} style={{ display: "flex", "flex-direction": "column", gap: "1rem", flex: 1 }}>
                    <FormInput label="Current Password" type="password" placeholder="Enter current password" name="old-password" error={errors().error?.oldPassword} />
                    <FormInput label="New Password" type="password" placeholder="Enter new password" name="new-password" error={errors().error?.newPassword} />
                    <FormInput label="Confirm Password" type="password" placeholder="Confirm new password" name="confirm-password" error={errors().error?.confirmPassword} />
                    <div style={{ flex: 1, display: "flex", "flex-direction": "column-reverse" }}>
                        <button type="submit" style={{ padding: "0.7rem", "border-radius": "4px", border: "none", background: "#4CAF50", color: "white", cursor: "pointer" }}>Change Password</button>
                        <Show when={errors().message}>
                            <InputError message={errors().message} />
                        </Show>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;