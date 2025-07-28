const contextMenu = document.getElementById(`file-context-menu`);

document.querySelectorAll('.file').forEach(fileElement => {
    (fileElement as HTMLElement).addEventListener('contextmenu', (e) => {
        e.preventDefault();

        if (contextMenu) {
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;

            const menuItems = contextMenu.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Clicked on ${item.textContent}`);
                    contextMenu.style.display = 'none';
                });
            });
        }

        document.addEventListener('click', () => {
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        }, { once: true });
    });
});