import { Html } from "@elysiajs/html";

const ImageIcon = (props: { size?: number }) => {
    const size = props.size || 24;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48"><g fill="none"><path fill="url(#fluentColorImage482)" d="M6 12.25A6.25 6.25 0 0 1 12.25 6h23.5A6.25 6.25 0 0 1 42 12.25v23.5A6.25 6.25 0 0 1 35.75 42h-23.5A6.25 6.25 0 0 1 6 35.75z"/><path fill="url(#fluentColorImage480)" d="m40.835 39.385l-14.36-14.36a3.5 3.5 0 0 0-4.95 0l-14.36 14.36A6.24 6.24 0 0 0 12.25 42h23.5a6.24 6.24 0 0 0 5.085-2.615"/><path fill="url(#fluentColorImage481)" d="M27 17a4 4 0 1 1 8 0a4 4 0 0 1-8 0"/><defs><linearGradient id="fluentColorImage480" x1="19.19" x2="23.289" y1="24" y2="42.935" gradientUnits="userSpaceOnUse"><stop stop-color="#b3e0ff"/><stop offset="1" stop-color="#8cd0ff"/></linearGradient><linearGradient id="fluentColorImage481" x1="29.4" x2="32.323" y1="12.111" y2="22.633" gradientUnits="userSpaceOnUse"><stop stop-color="#fdfdfd"/><stop offset="1" stop-color="#b3e0ff"/></linearGradient><radialGradient id="fluentColorImage482" cx="0" cy="0" r="1" gradientTransform="matrix(61.71419 78.10727 -71.04382 56.1332 -8.142 -14.25)" gradientUnits="userSpaceOnUse"><stop offset=".338" stop-color="#0fafff"/><stop offset=".529" stop-color="#367af2"/></radialGradient></defs></g></svg>
    );
}

export default ImageIcon;