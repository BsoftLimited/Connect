import { Html } from "@elysiajs/html";

const TopBar = () =>{
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: '1px solid #ccc', padding: "20px 50px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <image src={"/assets/vectors/streamline-freehand--wifi-laptop.svg"} alt="File Icon" style={{ width: '46px', height: '46px' }} />
                <h2 style={{ fontSize: "30px" }}>Connect</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "red",  }} width={"45px"} height={"45px"} viewBox="0 0 24 24"><g fill="currentColor" fillRule="evenodd" clipRule="evenodd"><path d="M16.12 8.85a5.35 5.35 0 0 0-4.529-2.359a7.7 7.7 0 0 0-2.65.43c-4.07 1.56-5.619 8.739.06 10.089c2.67.66 5.37.74 7-1.46a6.17 6.17 0 0 0 .12-6.7m-.78 6.16c-1.45 1.79-3.789 1.55-5.999 1a5 5 0 0 1-1.18-.42c-3.16-1.64-1.88-6.69 1.07-7.95c.61-.26 3.84-1.429 6.08 1.37c.4.472.679 1.036.81 1.64a5.28 5.28 0 0 1-.78 4.36"></path><path d="M11.891 10.01a5 5 0 0 1-.26-2.17c.1-.43-.74-.5-.82 0a4.1 4.1 0 0 0 1.08 3.78a5.44 5.44 0 0 0 3.67 1.84a.371.371 0 0 0 .06-.74a4.89 4.89 0 0 1-3.73-2.71m-.67-4.998a.33.33 0 0 0 .32-.33q.125-.64.17-1.29a5.9 5.9 0 0 0-.44-2a.31.31 0 0 0-.56.22c-.02.29-.23 3.4.51 3.4M3.313 12.19c-.44-.07-.83-.21-1.25-.28s-2.06.04-2.06.36c-.09.64 2.11.77 3.31.57a.33.33 0 0 0 0-.65m18.627-.25c-.42.08-.81.22-1.24.29a.33.33 0 0 0 0 .65q.646.114 1.3.13c.55 0 2-.42 2-.74s-1.74-.38-2.06-.33m-9.609 7.6c0-.11-.17-.15-.38-.09c-.37.11-.81 2.18-.09 3.11a.326.326 0 0 0 .535.067a.33.33 0 0 0 .045-.357a8.6 8.6 0 0 0-.11-2.73m-5.659-1.48c-.39.36-2.13 1.43-2.35 2.23c-.05.18-.06.31 0 .41a.36.36 0 0 0 .21.12a5.13 5.13 0 0 0 2.6-2.35a.32.32 0 0 0-.46-.41m10.698.06a.33.33 0 0 0-.5.42q.337.587.79 1.09a7.2 7.2 0 0 0 1.84 1.24a.32.32 0 0 0 .2-.13c.63-.58-2.18-2.48-2.33-2.62M5.742 7.921a.322.322 0 1 0 .46-.45a6 6 0 0 0-2.7-2.19c-.37-.16-.56.05-.54.21c0 .35 1.09 1.36 1.54 1.65s.84.49 1.24.78M21 5.531c0-.15-.16-.38-.54-.2a5.9 5.9 0 0 0-2.68 2.2a.322.322 0 0 0 .46.45c.19-.15 2.76-1.73 2.76-2.45"></path></g></svg>
                <a href="/settings" style={{ textDecoration: 'none' }}>
                    <image src={"/assets/vectors/streamline-freehand--settings-cog.svg"} style={{ width: '24px', height: '24px' }}/>
                </a>
            </div>
        </div>
    );
}

export default TopBar;