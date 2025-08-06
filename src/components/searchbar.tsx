import { Html } from "@elysiajs/html";

const SearchBar = (props: {name: string}) => {
    return (
        <div class="searchbar">
            <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "inherit" }} width={"1.5rem"} height={"1.5rem"} viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5}><path d="M20 12V5.749a.6.6 0 0 0-.176-.425l-3.148-3.148A.6.6 0 0 0 16.252 2H4.6a.6.6 0 0 0-.6.6v18.8a.6.6 0 0 0 .6.6H11M8 10h8M8 6h4m-4 8h3m9.5 6.5L22 22"></path><path d="M15 18a3 3 0 1 0 6 0a3 3 0 0 0-6 0m1-16v3.4a.6.6 0 0 0 .6.6H20"></path></g></svg>
            </div>
            <input id="search-input" class="search-input" type="text" placeholder={`Filter ${props.name}...`} />
        </div>
    );
}

export default SearchBar;