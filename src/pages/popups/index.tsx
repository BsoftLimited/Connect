import type { ParentComponent } from "solid-js";

export type PopUpComponent = ParentComponent<{ onClose: () => void }>

export const PopUp: ParentComponent = (props) =>{
    return (
        <div class="popup">
            <div>{props.children}</div>
        </div>
    );
}
