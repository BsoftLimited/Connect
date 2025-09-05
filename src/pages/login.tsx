import { createSignal, JSX, Show } from "solid-js";
import { render } from "solid-js/web";
import TopBar from "./components/topbar";
import RequestButton from "./components/request-button";
import AllProviders from "./providers";

interface LoginStatus{
    message: string;
    type: "warning" | "error";
}

const Login = () =>{
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [status, setStatus] = createSignal<LoginStatus>();

    const handleEmailChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (event) => {
        event.preventDefault();
        setEmail((event.target as HTMLInputElement).value);
    };
    const handlePasswordChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (event) => {
        event.preventDefault();
        setPassword((event.target as HTMLInputElement).value);
    };

    const handleLogin = async () => {
        if (!email() || !password()) {
            setStatus({ message: "Email and password are required", type: "warning" });
            return;
        }

        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email(), password: password() })
        });

        if (response.ok) {
            window.location.reload(); // Reload the page to reflect the login state
        } else if (response.status === 404) {
            setStatus({ message: "Invalid email or password", type: "error" });
        } else {
            const error = await response.text();
            console.error("Login failed:", error);
            setStatus({ message: "Login failed", type: "error" });
        }
    };
    
    return (
        <div class="login-container" style={{ display: "flex", "flex-direction": "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
            <TopBar transparent/>
            <div class="container">
                <div class="form-container">
                    <form class="slidin">
                        <label for='email'>Email</label>
                        <div class="input-field">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.864 0-3.507-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709t2.859 1.924t1.925 2.857T21 12v.989q0 1.263-.868 2.137T18 16q-.894 0-1.63-.49q-.737-.49-1.09-1.306q-.57.821-1.425 1.308T12 16q-1.671 0-2.835-1.164Q8 13.67 8 12t1.165-2.835T12 8t2.836 1.165T16 12v.989q0 .822.589 1.417T18 15t1.412-.594t.588-1.418V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v1zm0-6q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"/></svg>
                            </span>
                            <input type='email' id='email' name='email' placeholder="Enter your email" onChange={handleEmailChange} value={email()} />
                        </div>
                        <label for='password'>Password</label>
                        <div class="input-field">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"><path d="m18.292 21.042l.414-7.05a5.303 5.303 0 0 1 10.588 0a1.11 1.11 0 0 0 1.097 1.046q2.46.031 4.529.08a1.956 1.956 0 0 0 1.997-2.114A12 12 0 0 0 24.958 2h-1.916a12 12 0 0 0-11.959 11.004l-.69 8.272"/><path d="M5.305 40.339c.232 2.48 2.237 4.243 4.726 4.367C12.966 44.85 17.542 45 24 45s11.034-.148 13.97-.294c2.488-.124 4.493-1.886 4.725-4.367c.168-1.797.305-4.22.305-7.339c0-3.118-.137-5.542-.305-7.338c-.232-2.482-2.237-4.244-4.726-4.368C35.034 21.148 30.458 21 24 21s-11.034.148-13.97.294c-2.488.124-4.493 1.886-4.725 4.367C5.137 27.459 5 29.881 5 33c0 3.118.137 5.542.305 7.339"/><path d="M26.482 34.137a4 4 0 1 0-4.964 0l-.637 2.73c-.22.945.287 1.883 1.247 2.014c.506.069 1.13.119 1.872.119s1.366-.05 1.872-.12c.96-.13 1.468-1.068 1.247-2.012z"/></g></svg>
                            </span>
                            <input type='password' id='password' name='password' placeholder="Enter your password" onChange={handlePasswordChange} value={password()} />
                        </div>
                        <RequestButton text="Login" loadingText="Logging in... Please wait" class='options-btn btn-white' request={handleLogin} />
                        <Show when={status()}>
                            <div style={{ color: status()?.type === "error" ? "red" : "orange", "margin-top": "1rem" }}>
                                {status()?.message}
                            </div>
                        </Show>
                    </form>
                </div>
            </div>
        </div>
    );
}

const root = document.getElementById("root");
if(root){
    render(() => (
        <AllProviders>
            <Login />
        </AllProviders>
    ), root);
}else{
    console.log("root element not found");
}