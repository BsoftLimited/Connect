import { Html } from "@elysiajs/html";

const Streaming = () => {
    return (
        <html lang="en">
            <head>
                <title>Connect | Streaming</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/styles/streaming.css" />
            </head>
            <body style={{ display: "flex", width: "100vw", height: "100vh", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "flex", width: "100%", flex: 1, flexDirection: "row", overflow: "hidden" }}>
                    <video controls style={{ width: "100%", height: "100%" }}>
                        <source src="/files/Videos/rick.and.morty.s08e02.(Netnaija.xyz).mkv" type="video/mp4" />
                    </video>
                </div>
            </body>
        </html>
    );
}

export default Streaming;