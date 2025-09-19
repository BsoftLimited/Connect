import {useUserContext} from "../providers/user.tsx";
import {createSignal, JSX, type Component, type ParentComponent} from "solid-js";
import {Show} from "solid-js/web";
import { useAccountsContext } from "../providers/accounts.tsx";
import type { User } from "../../common/user.ts";
import { formatAccessLevel } from "../../utils/util.ts";

interface ProfileDetailProps{
    label: string,
    value?: string,
    edith?: CallableFunction
}

const ProfileDetail: ParentComponent<ProfileDetailProps> = (props) =>{
    const { userState } = useUserContext();

    const edith = () =>{
        if(props.edith){
            props.edith();
        }
    }

    return (
        <div style={{ width: "30rem", display: "flex", "flex-direction": "row", gap: "8px", "align-items": props.value ? "start" : "center", "padding": "0.7rem 1rem" }}>
            {props.children}
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", width: "100%" }}>
                    <div style={{ display: "flex", "flex-direction": "row", gap: "4px", "align-items": "center", "font-weight": "300", "font-size": "16px" }}>
                        { props.label }
                    </div>
                    <Show when={props.edith && userState().user?.role !== "admin"}>
                        <span class={"clicakble"} onClick={edith}>Edit</span>
                    </Show>
                </div>
                <Show when={props.value}>
                    <div style={{ "margin-top": "4px", "font-weight": "600" }}>{ props.value }</div>
                </Show>
            </div>
        </div>
    );
}


const Profile = () =>{
    const { userState } = useUserContext();
    const { openPanel } = useAccountsContext();

    const edithProfile = () => openPanel("Edit Profile");
    const edithPassword = () => openPanel("Change Password");

    return (
        <div style={{ width: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Profile</h1>
            <div class={"profile-container"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10rem" height="10rem" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-opacity="0.16" d="M3 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0"/>
                    <circle cx="12" cy="10" r="4" fill="#f8a365ff" />
                    <path fill="currentColor" fill-rule="evenodd" fill-opacity="0.62" d="M18.22 18.246c.06.097.041.22-.04.297A8.97 8.97 0 0 1 12 21a8.97 8.97 0 0 1-6.18-2.457a.24.24 0 0 1-.04-.297C6.942 16.318 9.291 15 12 15s5.057 1.318 6.22 3.246" clip-rule="evenodd"/>
                </svg>
                <div class={"profile-details-container"}>
                    <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", "align-items": "center", width: "100%", "padding": "0.7rem 1rem" }}>
                        <div style={{ "display": "flex", "flex-direction": "row", "align-items": "center", gap: "4px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="2.4rem" height="2.4rem" viewBox="0 0 16 16">
                                <path fill="currentColor" d="M9.5 5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM9 9.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-2.39-3C6.61 7.328 5.891 8 5 8s-1.61-.672-1.61-1.5S4.109 5 5 5s1.61.672 1.61 1.5M5 8h-.04c-.92 0-1.72.585-1.94 1.42c-.08.295.16.582.485.582h3c.326 0 .565-.286.486-.582C6.768 8.586 5.971 8 5.051 8h-.04z"/>
                                <path fill="currentColor" fill-rule="evenodd" d="M.327 3.64C0 4.282 0 5.12 0 6.8v2.4c0 1.68 0 2.52.327 3.16a3.02 3.02 0 0 0 1.31 1.31c.642.327 1.48.327 3.16.327h6.4c1.68 0 2.52 0 3.16-.327a3 3 0 0 0 1.31-1.31c.327-.642.327-1.48.327-3.16V6.8c0-1.68 0-2.52-.327-3.16a3 3 0 0 0-1.31-1.31c-.642-.327-1.48-.327-3.16-.327h-6.4c-1.68 0-2.52 0-3.16.327a3.02 3.02 0 0 0-1.31 1.31m10.9-.638h-6.4c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819c-.037.45-.038 1.03-.038 1.89v2.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18c.45.036 1.03.037 1.89.037h6.4c.857 0 1.44 0 1.89-.037c.438-.036.663-.101.819-.18c.376-.192.682-.498.874-.874c.08-.156.145-.381.18-.82c.037-.45.038-1.03.038-1.89v-2.4c0-.856-.001-1.44-.038-1.89c-.036-.437-.101-.662-.18-.818a2 2 0 0 0-.874-.874c-.156-.08-.381-.145-.819-.18c-.45-.037-1.03-.038-1.89-.038" clip-rule="evenodd"/>
                            </svg>
                            <span style={{ "font-size": "16px" }}>Profile Details</span>
                        </div>
                        <Show when={userState().user?.role !== "admin"}>
                            <span class={"clicakble"} onClick={edithProfile}>Edit</span>
                        </Show>
                    </div>
                    <hr />
                    <ProfileDetail label={"Email"} value={userState().user?.email}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 21q-1.864 0-3.507-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709t2.859 1.924t1.925 2.857T21 12v.989q0 1.263-.868 2.137T18 16q-.894 0-1.63-.49q-.737-.49-1.09-1.306q-.57.821-1.425 1.308T12 16q-1.671 0-2.835-1.164Q8 13.67 8 12t1.165-2.835T12 8t2.836 1.165T16 12v.989q0 .822.589 1.417T18 15t1.412-.594t.588-1.418V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v1zm0-6q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"/>
                        </svg>
                    </ProfileDetail>
                    <ProfileDetail label={"Username"} value={ userState().user?.username }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2.2rem" height="2.2rem" viewBox="0 0 256 256">
                            <g fill="currentColor">
                                <path d="M192 96a64 64 0 1 1-64-64a64 64 0 0 1 64 64" opacity="0"/>
                                <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8M72 96a56 56 0 1 1 56 56a56.06 56.06 0 0 1-56-56"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                    <ProfileDetail label={"Role"} value={ userState().user?.role }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2.2rem" height="2.2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M4.5 9.5a7.5 7.5 0 1 1 12.501 5.59c-1.12 1.003-1.68 1.505-1.832 1.69c-.487.601-.508.65-.63 1.413c-.039.237-.039.593-.039 1.307c0 .935 0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549C13.402 22 12.935 22 12 22s-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549c-.201-.348-.201-.815-.201-1.75c0-.713 0-1.07-.038-1.307c-.123-.763-.144-.812-.631-1.412c-.151-.186-.712-.688-1.832-1.692A7.48 7.48 0 0 1 4.5 9.5Z"/>
                                <path d="M14.5 19.5h-5" opacity="0.5"/><path stroke-linecap="round" d="M12 17v-2m0 0a2 2 0 0 0 1.732-1M12 15a2 2 0 0 1-1.732-1" opacity="0.5"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                    <ProfileDetail label={"Access level"} value={ formatAccessLevel(userState().user) }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                <path d="M18 12a6 6 0 1 0-12 0c0 3.314 1 5.5 3 8"/>
                                <path d="M15 21c-5.5-3.5-6-7.343-6-9a3 3 0 1 1 6 0a3 3 0 1 0 6 0a9 9 0 1 0-17.777 2"/>
                                <path d="M12 12c.5 5 5.5 7 5.5 7"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                    <hr />
                    <ProfileDetail label={"Password"} edith={edithPassword}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16Z"/>
                                <circle cx="12" cy="16" r="2" opacity="0.5"/>
                                <path stroke-linecap="round" d="M6 10V8a6 6 0 1 1 12 0v2" opacity="0.5"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                </div>
            </div>
        </div>
    );
}

export default Profile;