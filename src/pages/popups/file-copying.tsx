import { Show, type Component } from "solid-js";
import type { CopyProgressEvent } from "../../utils/file-handle_bridge";
import { PopUp } from "../components/pop-up";
import type { ProgressReport } from "../providers/app";
import InputError from "../components/input-error";

interface FileCopyingProps{
    file: string,
    destination: string,
    progressReport: ProgressReport<CopyProgressEvent>,
}

const FileCopying: Component<FileCopyingProps> = (props) =>{
    return (
        <PopUp>
            <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", "width": "40rem", color: "grey" }}>
                <div style={{ "font-size": "16px", "font-weight": "lighter" }}>Copying file: {props.file} to {props.destination}</div>
                <Show when={ props.progressReport && props.progressReport?.progress?.total_files !== 0}>
                    <div style={{ width: "100%", display: "flex", "flex-direction": "row", gap: "0.4rem", "align-items": "center", "font-size": "20px", "font-weight": "lighter" }}>
                        <div style={{ display: "flex", "align-items": "center", "justify-content": "center", "min-width": "80px", padding: "0.4rem", "aspect-ratio": 1, border: "solid 2px grey", "border-radius": "50%" }}>{props.progressReport?.progress?.files_copied}/{props.progressReport?.progress?.total_files}</div>
                        <div style={{ flex: 1, "font-size": "14px" }}>
                            <progress style={{ width: "100%", height: "2px" }} max={props.progressReport?.progress?.total_bytes} value={props.progressReport?.progress?.bytes_copied}/>
                            <div style={{ width: "100%", "word-break": "break-word" }}>Copying: { props.progressReport?.progress?.name }</div>
                        </div>
                    </div>
                </Show>
                <Show when={props.progressReport?.errorMessage}>
                    <div style={{ width: "100%" }}>
                        <InputError message={props.progressReport?.errorMessage}/>
                    </div>
                </Show>
            </div>
        </PopUp>
    );
}

export default FileCopying;