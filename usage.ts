import { copyFile, copyFolder, folderInfo } from "./src/utils/file-handle_bridge";

/*folderInfo("C:/Users/Bobby/Pictures").then((value)=>{
    console.log(value);
}).catch(error => console.error(error));*/

/*copyFile("C:/Users/Bobby/Downloads/func-cli-x64.msi", "C:/Users/Bobby/Desktop", (progress)=>{
  console.log(progress);
});*/

copyFolder("C:/Users/Bobby/Pictures", "C:/Users/Bobby/Desktop/Pictures", (progress)=>{
    console.log(progress);
});