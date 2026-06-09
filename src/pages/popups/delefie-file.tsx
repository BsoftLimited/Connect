import { Show, type Component } from "solid-js";
import { PopUp } from "../components/pop-up";
import InputError from "../components/input-error";
import PopUpConfirm from "../components/popup-confirm";
import type { DeletePregressEvent } from "../../utils/file-handle_bridge";
import { useAppContext, type ProgressReport } from "../providers/app";
import { fileName } from "../../utils/util";

interface DeleteFileProps{
    file?: string
    progressReport?: ProgressReport<DeletePregressEvent>,
    procced: (file?: string) =>void,
    cancel: () => void
}

const DeleteFile: Component<DeleteFileProps> = (props) =>{
    const { appState } = useAppContext();
    const proceed = () => props.procced(props.file);
    const file =() => props.file || appState().directory?.name || "unknown";

    return (
        <PopUp>
            <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", gap: "0.6rem", color: "grey", "max-width": props.progressReport === undefined ? "24rem" : "40rem" }}>
                <Show when={props.progressReport === undefined || props.progressReport?.progress === undefined}>
                    <div style={{ "font-size": "14px", "font-weight": "lighter" }}>Are you sure you want to delete file <strong>{file()}</strong>?<br/>This action cannot be undone.</div>
                    <PopUpConfirm cancel={props.cancel} proceed={proceed} />
                    <Show when={props.progressReport?.errorMessage}>
                        <div style={{ width: "100%" }}>
                            <InputError message={props.progressReport?.errorMessage}/>
                        </div>
                    </Show>
                </Show>
                <Show when={props.progressReport?.progress}>
                    <div style={{ "font-size": "16px", "font-weight": "lighter" }}>Deleting file: <strong>{file()}</strong></div>
                    <Show when={ props.progressReport && props.progressReport?.progress?.total !== 0}>
                        <div style={{ width: "100%", display: "flex", "flex-direction": "row", gap: "0.4rem", "align-items": "center", "font-size": "20px", "font-weight": "lighter" }}>
                            <div style={{ display: "flex", "align-items": "center", "justify-content": "center", "min-width": "80px", padding: "0.4rem", "aspect-ratio": 1, border: "solid 2px grey", "border-radius": "50%" }}>{props.progressReport?.progress?.deleted}/{props.progressReport?.progress?.total}</div>
                            <div style={{ flex: 1, "font-size": "14px" }}>
                                <progress style={{ width: "100%", height: "2px" }} max={props.progressReport?.progress?.total} value={props.progressReport?.progress?.deleted}/>
                                <div style={{ width: "100%", "word-break": "break-word" }}>Deleting: { fileName(props.progressReport?.progress?.filePath!) }</div>
                            </div>
                        </div>
                    </Show>
                    <Show when={props.progressReport?.errorMessage}>
                        <div style={{ width: "100%" }}>
                            <InputError message={props.progressReport?.errorMessage}/>
                        </div>
                    </Show>
                </Show>
            </div>
        </PopUp>
    );
}

export default DeleteFile;