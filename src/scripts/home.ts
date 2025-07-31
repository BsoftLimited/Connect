const queryLocal = <T>(name: string, init: T) =>{
    const response = localStorage.getItem(name);
    if(response){
        return JSON.parse(response);
    }

    localStorage.setItem(name, JSON.stringify(init));
    return init;
}

const initContext = ( contextMenu: HTMLElement, className: string, init: ()=> void, clicked: (fileName: string, menuID: string)=> void) =>{
    document.querySelectorAll(`.${className}`).forEach(element => {
        (element as HTMLElement).oncontextmenu = (e) => {
            e.preventDefault();

            if (contextMenu) {
                init();
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

function handleScroll(){
    console.log("idhfdidid");
}

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

        const folderInit = () =>{
            const download = document.getElementById("menu-download");
            if(download){
                download.style.display = "none";
            }
        }

        const fileInit = () =>{
            const download = document.getElementById("menu-download");
            if(download){
                download.style.display = "block";
            }
        }

        initContext(contextMenu, "folder", folderInit, (fileName, menuId)=>{
            console.log(`clicked on ${menuId} menu on ${fileName} folder`);
        });

        initContext(contextMenu, "file", fileInit, (fileName, menuId)=>{
            console.log(`clicked on ${menuId} menu on ${fileName} file`);
        });
    }
});