import { createSignal, Show } from "solid-js";
import type { SignUpData, SignInStatus } from "../../common";
import RequestButton from "./request-button";
import SigninInput from "./signin-input";
import { isFormValid, request, type RequestFailed } from "../../utils/util";
import InputError from "./input-error";

const SignUp = () =>{
    const [status, setStatus] = createSignal<SignInStatus>();
    const [errors, setErrors] = createSignal<Partial<SignUpData> & { confirmPassword?: string }>({});

    const [email, setEmail] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    
    const submit = async() =>{
        const errors = isFormValid({ 
            username: username(),
            email: email(),
            password: password(),
            confirmPassword: confirmPassword()
        });

        setErrors(errors);

        if(Object.keys(errors).length > 0){
            return;
        }

        try{
            const response = await request({ url: `/auth/register`, input: { username: username(), email: email(), password: password() }, method: "POST" });
            if(response.status === 201){
                window.location.reload(); // Reload the page to reflect the login state
            }
        }catch(error){
            console.log(error);
            const response = error as RequestFailed;
            if(response.status === 401){
                setErrors(response.error.error);
                setStatus({ status: "error", message: response.error.message });
            }else{
                console.error(response);
                setStatus({ status: "error", message: "An error occurred. Please try again." });
            }
        }
    } 

    return (
         <form class="slidin">
            <SigninInput label="Username" name="username" placeholder="Enter username" type="text" error={errors().username} value={username()} valueChange={setUsername}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="6" r="4"/>
                            <ellipse cx="12" cy="17" rx="7" ry="4"/>
                        </g>
                    </svg>
            </SigninInput>
            <SigninInput label="Email" name="email" placeholder="Enter email" type="email" error={errors().email} value={email()} valueChange={setEmail}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 21q-1.864 0-3.507-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709t2.859 1.924t1.925 2.857T21 12v.989q0 1.263-.868 2.137T18 16q-.894 0-1.63-.49q-.737-.49-1.09-1.306q-.57.821-1.425 1.308T12 16q-1.671 0-2.835-1.164Q8 13.67 8 12t1.165-2.835T12 8t2.836 1.165T16 12v.989q0 .822.589 1.417T18 15t1.412-.594t.588-1.418V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v1zm0-6q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"/>
                </svg>
            </SigninInput>
            <SigninInput label="Password" name="password" placeholder="Enter password" type="password" error={errors().password} value={password()} valueChange={setPassword}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                        <path d="m18.292 21.042l.414-7.05a5.303 5.303 0 0 1 10.588 0a1.11 1.11 0 0 0 1.097 1.046q2.46.031 4.529.08a1.956 1.956 0 0 0 1.997-2.114A12 12 0 0 0 24.958 2h-1.916a12 12 0 0 0-11.959 11.004l-.69 8.272"/>
                        <path d="M5.305 40.339c.232 2.48 2.237 4.243 4.726 4.367C12.966 44.85 17.542 45 24 45s11.034-.148 13.97-.294c2.488-.124 4.493-1.886 4.725-4.367c.168-1.797.305-4.22.305-7.339c0-3.118-.137-5.542-.305-7.338c-.232-2.482-2.237-4.244-4.726-4.368C35.034 21.148 30.458 21 24 21s-11.034.148-13.97.294c-2.488.124-4.493 1.886-4.725 4.367C5.137 27.459 5 29.881 5 33c0 3.118.137 5.542.305 7.339"/>
                        <path d="M26.482 34.137a4 4 0 1 0-4.964 0l-.637 2.73c-.22.945.287 1.883 1.247 2.014c.506.069 1.13.119 1.872.119s1.366-.05 1.872-.12c.96-.13 1.468-1.068 1.247-2.012z"/>
                    </g>
                </svg>
            </SigninInput>
            <SigninInput label="Confirm Password" name="confirm-password" placeholder="Confirm your password" type="password" error={errors().confirmPassword} value={confirmPassword()} valueChange={setConfirmPassword}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                        <path d="m18.292 21.042l.414-7.05a5.303 5.303 0 0 1 10.588 0a1.11 1.11 0 0 0 1.097 1.046q2.46.031 4.529.08a1.956 1.956 0 0 0 1.997-2.114A12 12 0 0 0 24.958 2h-1.916a12 12 0 0 0-11.959 11.004l-.69 8.272"/>
                        <path d="M5.305 40.339c.232 2.48 2.237 4.243 4.726 4.367C12.966 44.85 17.542 45 24 45s11.034-.148 13.97-.294c2.488-.124 4.493-1.886 4.725-4.367c.168-1.797.305-4.22.305-7.339c0-3.118-.137-5.542-.305-7.338c-.232-2.482-2.237-4.244-4.726-4.368C35.034 21.148 30.458 21 24 21s-11.034.148-13.97.294c-2.488.124-4.493 1.886-4.725 4.367C5.137 27.459 5 29.881 5 33c0 3.118.137 5.542.305 7.339"/>
                        <path d="M26.482 34.137a4 4 0 1 0-4.964 0l-.637 2.73c-.22.945.287 1.883 1.247 2.014c.506.069 1.13.119 1.872.119s1.366-.05 1.872-.12c.96-.13 1.468-1.068 1.247-2.012z"/>
                    </g>
                </svg>
            </SigninInput>
            <div>
                <RequestButton text="Submit" loadingText="Registering... Please wait" class='options-btn btn-white' request={submit} />
                <Show when={status()}>
                    <InputError message={status()?.message} />
                </Show>
            </div>
        </form>
    );
}

export default SignUp;