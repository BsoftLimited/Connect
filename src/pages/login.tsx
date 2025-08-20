import { render } from "solid-js/web";

const Login = () =>{
    return (
        <div class="login-container">
            <div class="form-container">
                <form class="slidin">
                    <label for='email'>Email:</label>
                    <input type='email' id='email' name='email' />
                    <label for='password'>Password:</label>
                    <input type='password' id='password' name='password' />
                    <button id="loginBtn" type="button" class='options-btn btn-white'>Login</button>
                </form>
            </div>
        </div>
    );
}

const root = document.getElementById("root");

if(root){
    render(() => (<Login />), root);
}else{
    console.log("root element not found");
}