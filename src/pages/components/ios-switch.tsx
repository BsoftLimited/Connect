import { createEffect, createSignal, onCleanup, type Component } from "solid-js";

export interface SwitchProps{
    label: string,
    checked?: boolean,
    disabled?: boolean
    size?: "small" | "medium" | "large"
    name?: string,
    onChange?: (checked: boolean) => void;
}

const IOSSwitch: Component<SwitchProps> = (props) =>{
    const [isChecked, setChecked] = createSignal(props.checked || false);
    const [isDragging, setDragging] = createSignal(false);
    const [dragOffset, setDragOffset] = createSignal(0);

    //update internal state when props change
    createEffect(()=>{
        if(props.checked !== undefined){
            setChecked(props.checked);
        }
    });

    const getSizeClasses = () =>{
        switch(props.size){
            case "small":
                return { track: "ios-switch--small", thumb: "ios-switch__thumb--small" };
            case "large":
                return { track: "ios-switch--large", thumb: "ios-switch__thumb--large" };
            default:
                return { track: "ios-switch--medium", thumb: "ios-switch__thumb--medium" };
        }
    }
    const sizes = getSizeClasses();

    const handleToggle = () =>{
        if(props.disabled){
            return;
        }

        const newValue = !isChecked();
        setChecked(newValue);
        props.onChange?.(newValue);
    }

    const handleDragStart = (e: MouseEvent | TouchEvent) =>{
        if(props.disabled){
            return;
        }

        setDragging(true);
        const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
        setDragOffset(clientX);
        e.preventDefault();
    }

    const handleDragMove = (e: MouseEvent | TouchEvent) =>{
        if(!isDragging() || props.disabled){
            return;
        }

        const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
        const movement = clientX - dragOffset();

        if(Math.abs(movement) > 10){
            const shouldTurnOn = movement > 0;
            if(shouldTurnOn !== isChecked()){
                setChecked(shouldTurnOn);
                props.onChange?.(shouldTurnOn);
            }
            setDragging(false);
        }
    }

    const handleDragEnd = () =>{
        setDragging(false);
        setDragOffset(0);
    }

    //Global event listening fro drag
    createEffect(()=>{
        if(isDragging()){
            const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
            const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
            const handleMouseUp = () => handleDragEnd();
            const handleTouchUp = () => handleDragEnd();

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchend", handleTouchUp);

            onCleanup(()=>{
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchend", handleTouchUp);
            });
        }
    });

    return (
        <div class={`ios-switch ${sizes.track} ${ isChecked() ? 'ios-switch--on' : 'ios-switch--off'} ${props.disabled ? 'ios-switch--disabled' : ''} ${ isDragging() ? 'ios-switch--dragging' : '' }`}
            onClick={handleToggle} onMouseDown={handleDragStart} onTouchStart={handleDragStart}
            role="switch" aria-checked={isChecked()} aria-disabled={props.disabled}>
            <div class={`ios-switch__thumb ${sizes.thumb} ${isDragging() ? 'ios-switch__thumb--dragging' : ''}`} />
            <div class="ios-switch__icon ios-switch__icon--check"></div>
            <div class="ios-switch__icon ios-switch__icon--x"></div>
        </div>
    );
}

export default IOSSwitch;