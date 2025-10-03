import { createSignal, JSX, Show, type Component } from "solid-js";
import type { AccessLevel, EditUserFailed, EditUserFormData, Role, User } from "../../common";
import { useAccountsContext } from "../providers/accounts";
import ProfileDetail from "./profile-detail";
import SubmitButton from "./submit-button";
import InputError from "./input-error";

interface EditUserProps{
    user: User
}

const EditUser: Component<EditUserProps> = (props) =>{
    const { updateUser } = useAccountsContext();
    const [error, setError] = createSignal<EditUserFailed>({});
    const [buttonEnabled, setButtonEnabled] = createSignal(false);

    const inputChange = () =>{
        if(!buttonEnabled()){
            console.log("enabled");
            setButtonEnabled(true);
        }
    }

    const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) =>{
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const requestData: EditUserFormData = {
            id: props.user.id,
            role: formData.get("role")?.toString() as Role,
            accessLevel: formData.get("access-level") as AccessLevel,
        }

        if(requestData.role === "guest" && requestData.accessLevel !== "read-only"){
            setError({ message: "Invalid form, check and try again.", error: { accessLevel: "Access Level for guests must be Read Only" } });
        }else{
            setError({});
        }

        updateUser(requestData).then((error)=>{
            setError(error);
        });
    }
    
    return (
        <form onSubmit={submit} style={{ padding: "1rem", height: "100%" }}>
            <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", height: "100%" }}>
                <h1 style={{ "padding-bottom": "2rem", "font-weight": "300" }}>User Details</h1>
                <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", gap: "1rem"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10rem" height="10rem" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-opacity="0.16" d="M3 12a9 9 0 1 1 18 0a9 9 0 0 1-18 0"/>
                        <circle cx="12" cy="10" r="4" fill="#f8a365ff" />
                        <path fill="currentColor" fill-rule="evenodd" fill-opacity="0.62" d="M18.22 18.246c.06.097.041.22-.04.297A8.97 8.97 0 0 1 12 21a8.97 8.97 0 0 1-6.18-2.457a.24.24 0 0 1-.04-.297C6.942 16.318 9.291 15 12 15s5.057 1.318 6.22 3.246" clip-rule="evenodd"/>
                    </svg>
                    <div class={"profile-details-container"} style={{ width: "100%" }}>
                        <ProfileDetail label={"Email"} value={props.user.email}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.4rem" height="1.4rem" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 21q-1.864 0-3.507-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.709-3.51Q4.417 6.85 5.63 5.634t2.857-1.925T11.997 3t3.51.709t2.859 1.924t1.925 2.857T21 12v.989q0 1.263-.868 2.137T18 16q-.894 0-1.63-.49q-.737-.49-1.09-1.306q-.57.821-1.425 1.308T12 16q-1.671 0-2.835-1.164Q8 13.67 8 12t1.165-2.835T12 8t2.836 1.165T16 12v.989q0 .822.589 1.417T18 15t1.412-.594t.588-1.418V12q0-3.35-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20h5v1zm0-6q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"/>
                            </svg>
                        </ProfileDetail>
                        <hr />
                        <ProfileDetail label={"Username"} value={ props.user.username }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.6rem" height="1.6rem" viewBox="0 0 256 256">
                                <g fill="currentColor">
                                    <path d="M192 96a64 64 0 1 1-64-64a64 64 0 0 1 64 64" opacity="0"/>
                                    <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8M72 96a56 56 0 1 1 56 56a56.06 56.06 0 0 1-56-56"/>
                                </g>
                            </svg>
                        </ProfileDetail>
                    </div>
                </div>
                <div class={"profile-details-container"} style={{ width: "100%" }}>
                    <div style={{ display: "flex", "flex-direction": "row", "justify-content": "space-between", "align-items": "center", width: "100%", "padding": "0.7rem 1rem" }}>
                        <div style={{ "display": "flex", "flex-direction": "row", "align-items": "center", gap: "4px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width={"2rem"} height={"2rem"} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M10.154 6.94a5.06 5.06 0 0 0-2.69 1.88a4.94 4.94 0 0 0-.63 3.938a4.33 4.33 0 0 0 2.7 3.05a5.8 5.8 0 0 0 2.819.24a6.5 6.5 0 0 0 2.57-1.05q.463-.313.859-.71q.29-.3.5-.66c.16-.314.268-.651.32-1a4.8 4.8 0 0 0 0-1.47a6 6 0 0 0-1.06-2.559a4.78 4.78 0 0 0-5.388-1.66M14.862 9c.448.665.726 1.43.81 2.229a3.6 3.6 0 0 1 0 1a2.2 2.2 0 0 1-.27.87a2 2 0 0 1-.46.509a4.4 4.4 0 0 1-.63.46c-.646.43-1.38.714-2.149.83a4.54 4.54 0 0 1-2.25-.2a3.27 3.27 0 0 1-1.999-2.25a4 4 0 0 1 .34-3.159a4.1 4.1 0 0 1 2.13-1.63A3.6 3.6 0 0 1 14.862 9"></path>
                                <path fill="currentColor" d="M23.98 10.469a3.2 3.2 0 0 0-.08-.78a1 1 0 0 0-.21-.43a1.26 1.26 0 0 0-.59-.38a3.7 3.7 0 0 0-.76-.13a3 3 0 0 1-1.25-.2a.76.76 0 0 1-.37-.55l-.22-1l-.16-.619c.09-.32.51-.53.7-.82a1 1 0 0 0 .14-.84a1.86 1.86 0 0 0-.47-.72c-.4-.42-1-.729-1.369-1.069c-.22-.19-.47-.49-.74-.71a1.8 1.8 0 0 0-.47-.29a1.07 1.07 0 0 0-.93.05c-.42.23-.74.79-1.07 1a.46.46 0 0 1-.329 0a3.5 3.5 0 0 1-.53-.12a3.2 3.2 0 0 1-.86-.34a.7.7 0 0 1-.3-.35l-.31-1.14a1.8 1.8 0 0 0-.08-.42a.5.5 0 0 0-.17-.24a1.2 1.2 0 0 0-.41-.17a1.6 1.6 0 0 0-.59-.06a.341.341 0 1 0 .06.68q.15-.02.3 0h.17v.25l.33 1.27c.11.286.305.531.56.7c.327.197.68.346 1.05.44q.395.135.81.18a1.17 1.17 0 0 0 .69-.17c.28-.18.56-.62.9-.88a.38.38 0 0 1 .38-.09q.2.102.36.26c.22.21.43.46.63.63s.779.55 1.139.88a1.2 1.2 0 0 1 .41.59c0 .14-.09.22-.19.32s-.29.27-.42.42q-.166.201-.25.45a1.1 1.1 0 0 0 0 .44q.063.33.17.649l.21 1a1.67 1.67 0 0 0 .73 1.07a4.1 4.1 0 0 0 1.63.35q.242.006.479.07a.36.36 0 0 1 .23.11l.06.599q.056.82-.01 1.64a1.07 1.07 0 0 1-.22.62l-.4.08a3.2 3.2 0 0 0-.7.29q-.253.142-.45.36c-.23.257-.428.543-.59.849q-.36.63-.64 1.3a3.1 3.1 0 0 0-.25 1.23c.021.444.144.879.36 1.269c.11.22.31.5.42.78c0 .09.09.17 0 .24l-1.529 1.14l-.43.28l-.84-.57a2.6 2.6 0 0 0-1.2-.29a4.15 4.15 0 0 0-1.629.44a4 4 0 0 0-.89.52c-.18.146-.314.34-.39.559l-.26 1.45l-.06.12a3 3 0 0 1-.59 0c-.429-.06-.859-.16-1.259-.21l-.45-.09a.35.35 0 0 1-.2-.07c-.32-.28-.35-.72-.58-1a1.54 1.54 0 0 0-.7-.53l-1.519-.49c-.25-.09-.52-.23-.79-.31a1.7 1.7 0 0 0-.5-.08c-.186 0-.37.04-.54.12a2.2 2.2 0 0 0-.55.36q-.133.15-.309.25a5 5 0 0 0-.37-.3c-.37-.28-.79-.54-1.15-.85a2.1 2.1 0 0 1-.5-.58a.57.57 0 0 1 0-.51c.2-.49.59-.999.72-1.419a1.6 1.6 0 0 0 0-.7a6.5 6.5 0 0 0-.39-1.09l-.26-.53a1.4 1.4 0 0 0-.67-.56a2.3 2.3 0 0 0-.69-.08a1 1 0 0 1-.459-.1c0-.069-.07-.319-.11-.429c-.11-.47-.28-.87-.43-1.29a2.7 2.7 0 0 1 0-.75a.55.55 0 0 1 .19-.43q.65-.304 1.25-.699a1.2 1.2 0 0 0 .24-.3c.11-.17.19-.37.28-.53s.36-.6.52-.9a3.7 3.7 0 0 0 .29-.71a1.47 1.47 0 0 0-.09-1.059a8 8 0 0 0-.73-1a1.2 1.2 0 0 1-.16-.27c0-.07-.07-.15 0-.22a4 4 0 0 1 .53-.64q.472-.46 1-.86q.198-.162.43-.28a.85.85 0 0 1 .399-.1l.35.28a4 4 0 0 0 .56.42q.222.134.47.21c.231.07.478.07.71 0q.562-.254 1.08-.59l.469-.27l.37-.259a.9.9 0 0 0 .34-.62a1.7 1.7 0 0 0-.07-.6a.83.83 0 0 1 0-.47l.31-.15q.37-.158.77-.22q.62-.112 1.25-.16a.3.3 0 1 0 0-.6q-.688.046-1.36.19a5 5 0 0 0-.93.25a2.6 2.6 0 0 0-.47.16a.63.63 0 0 0-.21.28c-.15.42.09.8 0 1.16a.26.26 0 0 1-.11.18l-.28.19l-.4.27c-.23.11-.54.34-.86.47a.67.67 0 0 1-.4.08a2 2 0 0 1-.38-.2c-.13-.09-.26-.2-.38-.3a2.5 2.5 0 0 0-.43-.37a.8.8 0 0 0-.349-.11a1.4 1.4 0 0 0-.63.11q-.389.154-.72.41q-.574.42-1.1.9a4.6 4.6 0 0 0-.65.75a.9.9 0 0 0-.1.69c.047.268.157.522.32.74q.36.426.64.909a.68.68 0 0 1 0 .47a2.7 2.7 0 0 1-.25.54c-.16.3-.35.58-.52.86l-.34.6c-.439.38-1.059.459-1.419.819a1.36 1.36 0 0 0-.41.91c-.02.336.01.673.09 1c.1.45.27.89.41 1.329a4 4 0 0 0 .14.55a.83.83 0 0 0 .3.39c.243.195.532.322.84.37q.255.008.5.08a.37.37 0 0 1 .17.16l.17.36q.141.327.25.67a.8.8 0 0 1 .07.44c-.16.519-.66.999-.81 1.609a1.54 1.54 0 0 0 .13 1.14c.193.342.447.647.75.9c.37.319.81.589 1.19.889q.266.25.58.44c.188.102.406.14.619.11a1.7 1.7 0 0 0 .48-.19q.248-.162.47-.36c.09-.07.18-.18.3-.18a.9.9 0 0 1 .27.06c.22.08.44.19.65.27l1.519.44a.44.44 0 0 1 .18.14c.27.38.36.89.74 1.22c.138.118.298.21.47.27q.413.11.84.15c.47.06.999.19 1.489.23q.385.036.77 0a.9.9 0 0 0 .46-.21c.171-.165.307-.362.4-.58a2.4 2.4 0 0 0 .16-.58q.04-.504.14-1c0-.09.15-.12.25-.18s.3-.14.41-.19a3.4 3.4 0 0 1 .999-.33c.29-.04.587.009.85.14c.23.12.55.43.84.56a1 1 0 0 0 .46.12a1.1 1.1 0 0 0 .489-.09q.339-.157.63-.39l1.6-1.27a1.11 1.11 0 0 0 .39-.93a4.3 4.3 0 0 0-.59-1.39a1.65 1.65 0 0 1-.23-.779a2.05 2.05 0 0 1 .17-.83q.225-.62.52-1.21q.18-.38.45-.71a.9.9 0 0 1 .27-.199q.187-.096.389-.16c.13 0 .3-.05.44-.1a1.1 1.1 0 0 0 .33-.19c.273-.27.451-.62.51-1q.12-.936.06-1.88"></path>
                            </svg>
                            <span style={{ "font-size": "16px" }}>User Configurations</span>
                        </div>
                    </div>
                    <hr />
                    <div style={{ display: "flex", "flex-direction": "row", gap: "4px", "align-items": "start", "font-weight": "300", "font-size": "16px", padding: "1rem 0.5rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2.2rem" height="2.2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M4.5 9.5a7.5 7.5 0 1 1 12.501 5.59c-1.12 1.003-1.68 1.505-1.832 1.69c-.487.601-.508.65-.63 1.413c-.039.237-.039.593-.039 1.307c0 .935 0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549C13.402 22 12.935 22 12 22s-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549c-.201-.348-.201-.815-.201-1.75c0-.713 0-1.07-.038-1.307c-.123-.763-.144-.812-.631-1.412c-.151-.186-.712-.688-1.832-1.692A7.48 7.48 0 0 1 4.5 9.5Z"/>
                                <path d="M14.5 19.5h-5" opacity="0.5"/><path stroke-linecap="round" d="M12 17v-2m0 0a2 2 0 0 0 1.732-1M12 15a2 2 0 0 1-1.732-1" opacity="0.5"/>
                            </g>
                        </svg>
                        <div style={{ display: "flex", "flex-direction": "column", width: "100%", gap: "4px" }}>
                            <label for="role">Role</label>
                            <select id="role" name="role" value={props.user.role} onChange={inputChange} style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}>
                                <option value="guest">Guest</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                    <hr />
                    <div style={{ display: "flex", "flex-direction": "row", gap: "4px", "align-items": "start", "font-weight": "300", "font-size": "16px", padding: "1rem 0.5rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                <path d="M18 12a6 6 0 1 0-12 0c0 3.314 1 5.5 3 8"/>
                                <path d="M15 21c-5.5-3.5-6-7.343-6-9a3 3 0 1 1 6 0a3 3 0 1 0 6 0a9 9 0 1 0-17.777 2"/>
                                <path d="M12 12c.5 5 5.5 7 5.5 7"/>
                            </g>
                        </svg>
                        <div style={{ display: "flex", "flex-direction": "column", width: "100%", gap: "4px" }}>
                            <label for="access-level">Access Level</label>
                            <select id="access-level" value={props.user.accessLevel} onChange={inputChange} name="access-level" style={{ padding: "0.5rem", "border-radius": "4px", border: "1px solid #ccc", width:"100%" }}>
                                <option value="read-only">Read Only</option>
                                <option value="read-write">Read & Write</option>
                            </select>
                            <Show when={error().error?.accessLevel}>
                                <InputError message={error()?.error?.accessLevel} />
                            </Show>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, display: "flex", "flex-direction": "column-reverse" }}>
                     <Show when={error().message}>
                        <InputError message={error()?.message} />
                    </Show>
                    <SubmitButton label="Save Changes" enabled={buttonEnabled()} />
                </div>
            </div>
        </form>
    );
}

export default EditUser;