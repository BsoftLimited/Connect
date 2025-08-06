import HomeIcon from "../vectors/home";

const PathPart = (props: { part: string }) => {
    return (
        <span style={{ display: "flex", "flex-direction": "row", "align-items": "center", gap: "0.6rem", color: "inherit" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={"0.8rem"} height={"0.8rem"} viewBox="0 0 1024 1024"><path fill="currentColor" d="M271.653 1023.192c-8.685 0-17.573-3.432-24.238-10.097c-13.33-13.33-13.33-35.144 0-48.474L703.67 508.163L254.08 58.573c-13.33-13.331-13.33-35.145 0-48.475s35.143-13.33 48.473 0L776.38 483.925c13.33 13.33 13.33 35.143 0 48.473l-480.492 480.694c-6.665 6.665-15.551 10.099-24.236 10.099z"></path></svg>
            {props.part}
        </span>
    );
}

const PathBar = (props: { path: string }) => {
    const pathParts = props.path === "/" ? [""] : props.path.split('/');

    return (
        <div class="pathbar">
            {pathParts.map((part, index) => {
                if(part === "") {
                    if(index < pathParts.length - 1){
                        return (
                            <a href="/">
                                <HomeIcon size={"1.5rem"}/>
                            </a>
                        );
                    }
                    return (
                        <HomeIcon size={"1.5rem"}/>
                    );
                }

                if(index < pathParts.length - 1){
                    return ( 
                        <a href={ `${pathParts.slice(0, index + 1).reduce((prev, current)=> `${prev}/${current}`)}` }>
                            <PathPart part={part} />
                        </a>
                    );
                }
                
                return ( 
                    <PathPart part={part} />
                );
            })}
        </div>
    );
}

export default PathBar;