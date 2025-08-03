import { isVideoOrAudio } from "../utils/util";

const queryLocal = <T>(name: string, init: T) =>{
    const response = localStorage.getItem(name);
    if(response){
        return JSON.parse(response);
    }

    localStorage.setItem(name, JSON.stringify(init));
    return init;
}

const initContext = ( contextMenu: HTMLElement, className: string, init: (fileName: string)=> void, clicked: (fileName: string, menuID: string)=> void) =>{
    document.querySelectorAll(`.${className}`).forEach(element => {
        (element as HTMLElement).oncontextmenu = (e) => {
            e.preventDefault();

            if (contextMenu) {
                init(element.id);
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;

                const menuItems = contextMenu.querySelectorAll('.menu-item');
                menuItems.forEach(item => {
                    (item as HTMLElement).onclick = () => {
                        clicked(element.id, item.id);
                        contextMenu.style.display = 'none';
                    }
                });
            }
        }
    });
}

const currentURL = window.location.pathname;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const contextMenu = document.getElementById(`file-context-menu`);
    searchInput?.addEventListener("input", (event) => {
        const filter = (event.target as HTMLInputElement).value.toLowerCase();
        const filesContainer = document.querySelector(".files-container");
        if (filesContainer) {
            filesContainer.querySelectorAll(".folder").forEach(folderItem => {
                const folderName = folderItem.id.toLowerCase();
                (folderItem as HTMLElement).style.display = folderName.includes(filter) ? "block" : "none";
                (folderItem as HTMLElement).onscroll = ()=> {
                    console.log("I am scrolling");
                }
            });

            filesContainer.querySelectorAll(".file").forEach(fileItem => {
                const fileName = fileItem.id.toLowerCase();
                (fileItem as HTMLElement).style.display = fileName.includes(filter) ? "block" : "none";
                (fileItem as HTMLElement).onchange = ()=> {
                    console.log("I am scrolling");
                }
            });
        }
    });

    if(contextMenu){
        document.addEventListener("click", ()=> contextMenu.style.display = 'none');
        const download = document.getElementById("menu-download");
            const open = document.getElementById("menu-open");

        const folderInit = () =>{
            if(download && open){
                download.style.display = "none";
                open.style.display = "block";
            }
        }

        const fileInit = (fileName: string) =>{
            if(download && open){
                download.style.display = "block";
                // check if the file is a video or audio file
                if(isVideoOrAudio(fileName)){
                    open.style.display = "block";
                }else{
                    open.style.display = "none";
                }
            }else{
                console.error("Download or Open menu item not found");
            }
        }

        initContext(contextMenu, "folder", folderInit, (fileName, menuId)=>{
            console.log(currentURL)
            console.log(`clicked on ${menuId} menu on ${fileName} folder`);
            if(menuId === "menu-open"){
                window.location.href = `${currentURL}/${fileName}`;
            }
        });

        initContext(contextMenu, "file", fileInit, (fileName, menuId)=>{
            console.log(currentURL)
            console.log(`/download${currentURL}/${fileName}`);
            console.log(`clicked on ${menuId} menu on ${fileName} file`);
            if(menuId === "menu-download"){
                window.location.href = `/download${currentURL}/${fileName}`;
            }else if(menuId === "menu-open"){
                if(isVideoOrAudio(fileName)){
                    window.location.href = `/streaming/${currentURL}/${fileName}`;
                }else{
                    window.location.href = `/files/${currentURL}/${fileName}`;
                }
            }
        });
    }
});