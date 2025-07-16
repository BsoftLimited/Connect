import { Html } from "@elysiajs/html";

const TopBar = () =>{
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: '1px solid #ccc', padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <image src={"/assets/vectors/streamline-freehand--wifi-laptop.svg"} alt="File Icon" style={{ width: '40px', height: '40px' }} />
                <h2>Connect</h2>
            </div>
            <a href="/settings" style={{ textDecoration: 'none' }}>
                <image src={"/assets/vectors/streamline-freehand--settings-cog.svg"} style={{ width: '24px', height: '24px' }}/>
            </a>
        </div>
    );
}

export default TopBar;