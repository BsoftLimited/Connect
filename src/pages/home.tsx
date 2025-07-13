import { Html } from "@elysiajs/html";

interface DirectoryProps {
    path: string;
}

const Connect = (path: string) => {
    Bun.$`ls ${path}`.text().then(result => {
        const files = result.split('\n').filter(file => file); // Filter out empty strings
    });

    return (
        <html lang="en">
            <head>
                <title>Connect</title>
                <link rel="stylesheet" href="/styles/home.css" />
            </head>
            <body>
                <h1>Downloads</h1>
                <p>Files in your Downloads folder:</p>
                <ul>
                    {/* This will be populated with file names from the server */}
                </ul>
            </body>
        </html>
    );
}