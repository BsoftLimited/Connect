import { createSignal, type Component } from "solid-js";
import { PopUp } from "../components/pop-up";
import FormInput from "../components/form-input";
import RequestButton from "../components/request-button";
import { useAppContext } from "../providers/app";
import { request } from "../../utils/util";
import InputError from "../components/input-error";

interface CreateFolderProps{
    done: () =>void,
    cancel: () => void
}

const CreateFolder: Component<CreateFolderProps> = (props) =>{
    const { appState } = useAppContext();
    const [input, setInput] = createSignal("");
    const [state, setState] = createSignal<{ loading: boolean, message?: string, errors?: { name: string } }>({ loading: false });

    const submit = async() =>{
        setState({ loading: true });
        try{
            if(input().length > 0){
                const result = await request({ url: "/api", method: "POST", input: { name: input(), directory: appState().directory?.path } });
                if(result.first){
                    props.done();
                }else{
                    const response = result.second;
                    setState({ loading: false, ...response.error});
                }
            }else{
                setState({ loading: false, errors: { name: "Folder name most have atleast one character" } })
            }
        }catch(error){
            console.error(error);
            setState({ loading: false, message: `unable to create folder: ${input()}` });
        }
    }

    return (
        <PopUp>
            <div style={{ "width": "20rem", display: "flex", "flex-direction": "column", "align-content": "center", gap: "0.8rem" }}>
                <FormInput label="Create Folder" error={state().errors?.name} valueChange={setInput} value={input()} placeholder="Folder name"  type="text" name="fileName"/>
                <div>
                    <div style={{ display: "flex", "flex-direction": "row", gap: "0.6rem", "align-items": "center" }}>
                        <button onClick={props.cancel} disabled={state().loading} style={{ border: "solid 2px var(--md-sys-color-primary)", color: "var(--md-sys-color-primary)", "border-radius": "4px", width: "100px", height: "40px", background: "transparent" }}>Cancel</button>
                        <RequestButton request={submit} loadingText="Creating Folder..." text="Create" style={{ border: "solid 2px var(--md-sys-color-primary)", "border-radius": "4px", flex: 1, height: "40px", background: "var(--md-sys-color-primary)" }} />
                    </div>
                    <InputError message={state().message}/>
                </div>
            </div>
        </PopUp>
    );
}

export default CreateFolder;