import ReactDOMClient from "react-dom/client";
import App from "../pages/app";
import React from "react";

// hydrate the app component
const root = ReactDOMClient.createRoot( document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);