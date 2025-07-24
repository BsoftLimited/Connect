import { Html } from "@elysiajs/html";

const SearchBar = () => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", border: "solid 2px grey", borderRadius: "20px", padding: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M15.793 15.793a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414" opacity={0.5}></path><path fill="currentColor" d="M2.75 10.5a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0m7.75-6.25a6.25 6.25 0 1 0 0 12.5a6.25 6.25 0 0 0 0-12.5"></path></svg>
            <input type="text" placeholder="Search..." style={{ minWidth: "300px", borderStyle: "none", fontSize: "14px", padding: "0px" }}/>
        </div>
    );
}

export default SearchBar;