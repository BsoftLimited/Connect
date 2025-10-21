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
    const {  } = useAppContext();
    const [input, setInput] = createSignal("");
    const [errors, setErrors] = createSignal<{ message?: string, errors?: { folderName: string } }>({});

    const submit = async() =>{
        try{
            if(input().length > 0){
                const result = await request({ url: "/api", method: "POST",  });
                if(result.first){

                }else{
                    const response = result.second;
                    setErrors(response.error);
                }
            }else{
                setErrors({ errors: { folderName: "Folder name most have atleast one character" } })
            }
        }catch(error){
            console.error(error);
            setErrors({ message: `unable to create folder: ${input()}` });
        }
    }

    return (
        <PopUp>
            <div style={{ "width": "360px", display: "flex", "flex-direction": "column", "align-content": "center" }}>
                <FormInput label="" error={errors().errors?.folderName} valueChange={setInput} value={input()} placeholder="Folder name"  type="text" name="fileName"/>
                <div>
                    <RequestButton request={submit} loadingText="Creating Folder..." text="create" class="create-btn" />
                    <InputError message={errors().message}/>
                </div>
            </div>
        </PopUp>
    );
}

export default CreateFolder;