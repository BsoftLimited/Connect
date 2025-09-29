import { createSignal, Show } from "solid-js";
import RequestButton from "./request-button";
import SigninInput from "./signin-input";
import { request } from "../../utils/util";
import InputError from "./input-error";

const CreatePassword = () => {
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [status, setStatus] = createSignal<{ status: "error" | "success", message: string }>();    
    const [errors, setErrors] = createSignal<{ password?: string, confirmPassword?: string }>({});

    const handleLogin = async() =>{
        if(password().length < 6){
            setErrors({ password: "Password should be at least 6 characters long" });
            setStatus({ message: "Password should be at least 6 characters long", status: "error" });
            return;
        }

        if(password() !== confirmPassword()){
            setErrors({ confirmPassword: "Passwords do not match" });
            setStatus({ message: "Passwords do not match", status: "error" });
            return;
        }

        try{
            const response = await request({ url: "/api/user/password", input: { password: password() }, method: "POST" });
            if(response.status === 201){
                window.location.reload();
            }
        }catch(error){
            console.log(error);
            setStatus({ status: "error", message: "An error occurred. Please try again." });
        }
    };

    return (
        <form class="slidin">
            <SigninInput label="Password" name="password" placeholder="Create password" type="password" value={password()} valueChange={setPassword} error={errors().password}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                        <path d="m18.292 21.042l.414-7.05a5.303 5.303 0 0 1 10.588 0a1.11 1.11 0 0 0 1.097 1.046q2.46.031 4.529.08a1.956 1.956 0 0 0 1.997-2.114A12 12 0 0 0 24.958 2h-1.916a12 12 0 0 0-11.959 11.004l-.69 8.272"/>
                        <path d="M5.305 40.339c.232 2.48 2.237 4.243 4.726 4.367C12.966 44.85 17.542 45 24 45s11.034-.148 13.97-.294c2.488-.124 4.493-1.886 4.725-4.367c.168-1.797.305-4.22.305-7.339c0-3.118-.137-5.542-.305-7.338c-.232-2.482-2.237-4.244-4.726-4.368C35.034 21.148 30.458 21 24 21s-11.034.148-13.97.294c-2.488.124-4.493 1.886-4.725 4.367C5.137 27.459 5 29.881 5 33c0 3.118.137 5.542.305 7.339"/>
                        <path d="M26.482 34.137a4 4 0 1 0-4.964 0l-.637 2.73c-.22.945.287 1.883 1.247 2.014c.506.069 1.13.119 1.872.119s1.366-.05 1.872-.12c.96-.13 1.468-1.068 1.247-2.012z"/>
                    </g>
                </svg>
            </SigninInput>
            <SigninInput label="Confirm Password" name="confirm-password" placeholder="Confrim password" type="password" value={confirmPassword()} valueChange={setConfirmPassword} error={errors().confirmPassword}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                        <path d="m18.292 21.042l.414-7.05a5.303 5.303 0 0 1 10.588 0a1.11 1.11 0 0 0 1.097 1.046q2.46.031 4.529.08a1.956 1.956 0 0 0 1.997-2.114A12 12 0 0 0 24.958 2h-1.916a12 12 0 0 0-11.959 11.004l-.69 8.272"/>
                        <path d="M5.305 40.339c.232 2.48 2.237 4.243 4.726 4.367C12.966 44.85 17.542 45 24 45s11.034-.148 13.97-.294c2.488-.124 4.493-1.886 4.725-4.367c.168-1.797.305-4.22.305-7.339c0-3.118-.137-5.542-.305-7.338c-.232-2.482-2.237-4.244-4.726-4.368C35.034 21.148 30.458 21 24 21s-11.034.148-13.97.294c-2.488.124-4.493 1.886-4.725 4.367C5.137 27.459 5 29.881 5 33c0 3.118.137 5.542.305 7.339"/>
                        <path d="M26.482 34.137a4 4 0 1 0-4.964 0l-.637 2.73c-.22.945.287 1.883 1.247 2.014c.506.069 1.13.119 1.872.119s1.366-.05 1.872-.12c.96-.13 1.468-1.068 1.247-2.012z"/>
                    </g>
                </svg>
            </SigninInput>
            <div>
                <RequestButton text="Submit" loadingText="saving password... Please wait" class='options-btn' request={handleLogin} />
                <Show when={status()}>
                    <InputError message={status()?.message} />
                </Show>
            </div>
        </form>
    );
};

export default CreatePassword;