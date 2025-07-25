import { Html } from "@elysiajs/html";

const PathBar = (props: { path: string }) => {
    const pathParts = props.path === "/" ? [""] : props.path.split('/');

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "10px" }}>
            {pathParts.map((part, index) => {
                if(index < pathParts.length - 1){

                }
                if(part === "") {
                    if(index < pathParts.length - 1){
                        return <a href="/" style={{ }}>Home</a>;
                    }
                    return <span style={{ }}>Home</span>;
                }

                if(index < pathParts.length - 1){
                    return ( 
                        <a href={ `${pathParts.slice(0, index + 1).reduce((prev, current)=> `${prev}/${current}`)}` } style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 1024 1024"><path fill="currentColor" d="M271.653 1023.192c-8.685 0-17.573-3.432-24.238-10.097c-13.33-13.33-13.33-35.144 0-48.474L703.67 508.163L254.08 58.573c-13.33-13.331-13.33-35.145 0-48.475s35.143-13.33 48.473 0L776.38 483.925c13.33 13.33 13.33 35.143 0 48.473l-480.492 480.694c-6.665 6.665-15.551 10.099-24.236 10.099z"></path></svg>
                            {part}
                        </a>
                    );
                }
                
                return ( 
                    <span style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 1024 1024"><path fill="currentColor" d="M271.653 1023.192c-8.685 0-17.573-3.432-24.238-10.097c-13.33-13.33-13.33-35.144 0-48.474L703.67 508.163L254.08 58.573c-13.33-13.331-13.33-35.145 0-48.475s35.143-13.33 48.473 0L776.38 483.925c13.33 13.33 13.33 35.143 0 48.473l-480.492 480.694c-6.665 6.665-15.551 10.099-24.236 10.099z"></path></svg>
                        {part}
                    </span>
                );
            })}
        </div>
    );
}

export default PathBar;