import { renderToString } from "react-dom/server";
import App from "./pages/app";

const renderApp = () => {
    const root = renderToString(<App />);
    
    return`<html lang="en">
            <head>
                <title>Connect | App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="/assets/css/app.css" />
                <link rel="icon" href="/favicon.ico" />
                <script src="/assets/js/app.js"></script>
            </head>
            <body>
                <main id="root">${root}</main>
                <script src="/assets/js/app.js"></script>
            </body>
        </html>`;
}

export default renderApp;