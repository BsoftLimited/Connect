import {useUserContext} from "../providers/user.tsx";
import type {ParentComponent} from "solid-js";
import {Show} from "solid-js/web";

interface ProfileDetailProps{
    label: string,
    value?: string,
    showEdith?: boolean
}

const ProfileDetail: ParentComponent<ProfileDetailProps> = (props) =>{
    return (
        <div style={{ width: "28rem", display: "flex", "flex-direction": "row", gap: "8px", "align-items": props.value ? "start" : "center", "padding": "0.7rem 1rem" }}>
            {props.children}
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", width: "100%" }}>
                    <div style={{ display: "flex", "flex-direction": "row", gap: "4px", "align-items": "center", "font-weight": "300", "font-size": "16px" }}>
                        { props.label }
                    </div>
                    <Show when={props.showEdith}>
                        <span class={"clicakble"}>Edit</span>
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

    const accessLevel = () =>{
        if(userState().user?.accessLevel === "read-write"){
            return "Read Write";
        }
        return "Read Only";
    }

    return (
        <div style={{ width: "100%" }}>
            <h1 style={{ "padding": "2rem 2rem 1rem 2rem", "font-weight": "300" }}>Profile</h1>
            <div class={"profile-container"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10rem" height="10rem" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-opacity="0.25" d="M3 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0"/>
                    <circle cx="12" cy="10" r="4" fill="currentColor"/>
                    <path fill="currentColor" fill-rule="evenodd" d="M18.22 18.246c.06.097.041.22-.04.297A8.97 8.97 0 0 1 12 21a8.97 8.97 0 0 1-6.18-2.457a.24.24 0 0 1-.04-.297C6.942 16.318 9.291 15 12 15s5.057 1.318 6.22 3.246" clip-rule="evenodd"/>
                </svg>
                <div class={"profile-details-container"}>
                    <ProfileDetail label={"Email"} value={userState().user?.email} showEdith={true}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 21q-1.864 0-3.507-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709t2.859 1.924t1.925 2.857T21 12v.989q0 1.263-.868 2.137T18 16q-.894 0-1.63-.49q-.737-.49-1.09-1.306q-.57.821-1.425 1.308T12 16q-1.671 0-2.835-1.164Q8 13.67 8 12t1.165-2.835T12 8t2.836 1.165T16 12v.989q0 .822.589 1.417T18 15t1.412-.594t.588-1.418V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v1zm0-6q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"/>
                        </svg>
                    </ProfileDetail>
                    <hr />
                    <ProfileDetail label={"Username"} value={ userState().user?.username } showEdith={true}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M9.5 5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM9 9.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-2.39-3C6.61 7.328 5.891 8 5 8s-1.61-.672-1.61-1.5S4.109 5 5 5s1.61.672 1.61 1.5M5 8h-.04c-.92 0-1.72.585-1.94 1.42c-.08.295.16.582.485.582h3c.326 0 .565-.286.486-.582C6.768 8.586 5.971 8 5.051 8h-.04z"/>
                            <path fill="currentColor" fill-rule="evenodd" d="M.327 3.64C0 4.282 0 5.12 0 6.8v2.4c0 1.68 0 2.52.327 3.16a3.02 3.02 0 0 0 1.31 1.31c.642.327 1.48.327 3.16.327h6.4c1.68 0 2.52 0 3.16-.327a3 3 0 0 0 1.31-1.31c.327-.642.327-1.48.327-3.16V6.8c0-1.68 0-2.52-.327-3.16a3 3 0 0 0-1.31-1.31c-.642-.327-1.48-.327-3.16-.327h-6.4c-1.68 0-2.52 0-3.16.327a3.02 3.02 0 0 0-1.31 1.31m10.9-.638h-6.4c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819c-.037.45-.038 1.03-.038 1.89v2.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18c.45.036 1.03.037 1.89.037h6.4c.857 0 1.44 0 1.89-.037c.438-.036.663-.101.819-.18c.376-.192.682-.498.874-.874c.08-.156.145-.381.18-.82c.037-.45.038-1.03.038-1.89v-2.4c0-.856-.001-1.44-.038-1.89c-.036-.437-.101-.662-.18-.818a2 2 0 0 0-.874-.874c-.156-.08-.381-.145-.819-.18c-.45-.037-1.03-.038-1.89-.038" clip-rule="evenodd"/>
                        </svg>
                    </ProfileDetail>
                    <hr />
                    <ProfileDetail label={"Role"} value={ userState().user?.role }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2.2rem" height="2.2rem" viewBox="0 0 48 48">
                            <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
                                <path d="M24 27a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/>
                                <path d="M44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4s20 8.954 20 20M33.63 39.21A17.9 17.9 0 0 1 24 42a17.9 17.9 0 0 1-9.831-2.92q-.36-.45-.73-.93A2.14 2.14 0 0 1 13 36.845c0-1.077.774-1.98 1.809-2.131c6.845-1 11.558-.914 18.412.035A2.08 2.08 0 0 1 35 36.818c0 .48-.165.946-.463 1.31q-.461.561-.907 1.082m3.355-2.744c-.16-1.872-1.581-3.434-3.49-3.698c-7.016-.971-11.92-1.064-18.975-.033c-1.92.28-3.335 1.856-3.503 3.733A17.94 17.94 0 0 1 6 24c0-9.941 8.059-18 18-18s18 8.059 18 18a17.94 17.94 0 0 1-5.015 12.466"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                    <hr />
                    <ProfileDetail label={"Access level"} value={ accessLevel() }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                <path d="M18 12a6 6 0 1 0-12 0c0 3.314 1 5.5 3 8"/>
                                <path d="M15 21c-5.5-3.5-6-7.343-6-9a3 3 0 1 1 6 0a3 3 0 1 0 6 0a9 9 0 1 0-17.777 2"/>
                                <path d="M12 12c.5 5 5.5 7 5.5 7"/>
                            </g>
                        </svg>
                    </ProfileDetail>
                    <hr />
                    <ProfileDetail label={"Password"} showEdith={true}>
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