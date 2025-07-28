import { Html } from "@elysiajs/html";
import TopBar from "../components/topbar";
import SideBar from "../components/sidebar";
import Directory, { DirectoryProps } from "../components/directory";

const Home = (props: DirectoryProps) => {
    return (
        <html lang="en">
            <head>
                <title>Connect | { props.details.path === "/" ? "Home" : props.details.name }</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/styles/home.css" />
            </head>
            <body style={{ display: "flex", width: "100vw", height: "100vh", flexDirection: "column", overflow: "hidden" }}>
                <TopBar />
                <div style={{ display: "flex", width: "100%", flex: 1, flexDirection: "row", overflow: "hidden" }}>
                    <SideBar />
                    <Directory details={props.details}/>
                </div>
                <script src="/assets/js/home.js"></script>
            </body>
        </html>
    );
}

export default Home;