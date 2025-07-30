const contextMenu = document.getElementById(`file-context-menu`);

document.querySelectorAll('.file').forEach(fileElement => {
    (fileElement as HTMLElement).oncontextmenu = (e) => {
        e.preventDefault();

        if (contextMenu) {
            const download = document.getElementById("menu-download");
            if(download){
                download.style.display = "block";
            }
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;

            const menuItems = contextMenu.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                (item as HTMLElement).onclick = () => {
                    console.log(`Clicked on ${item.textContent}`);
                    contextMenu.style.display = 'none';
                }
            });
        }

        document.onclick = () => {
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        }
    }
});

document.querySelectorAll('.folder').forEach(folderElement => {
    (folderElement as HTMLElement).oncontextmenu = (e) => {
        e.preventDefault();

        if (contextMenu) {
            const download = document.getElementById("menu-download");
            if(download){
                download.style.display = "none";
            }

            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;

            const menuItems = contextMenu.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                (item as HTMLElement).onclick = () => {
                    console.log(`Clicked on ${item.textContent}`);
                    contextMenu.style.display = 'none';
                }
            });
        }

        document.onclick = () => {
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", (event) => {
        const filter = (event.target as HTMLInputElement).value.toLowerCase();
        const filesContainer = document.querySelector(".files-container");
        if (filesContainer) {
            filesContainer.querySelectorAll(".folder").forEach(folderItem => {
                const folderName = folderItem.id.toLowerCase();
                (folderItem as HTMLElement).style.display = folderName.includes(filter) ? "block" : "none";
            });

            filesContainer.querySelectorAll(".file").forEach(fileItem => {
                const fileName = fileItem.id.toLowerCase();
                (fileItem as HTMLElement).style.display = fileName.includes(filter) ? "block" : "none";
            });
        }
    });
});