import { copy, folderInfo, storageInfo } from "./src/utils/file-handle_bridge";

/*folderInfo("C:/Users/okele/Pictures").then((value)=>{
    console.log(value);
}).catch(error => console.error(error));

copy("C:/Users/okele/Downloads/ffmpeg-setup.exe", "C:/Users/okele/Desktop", (progress)=>{
  console.log(progress);
});

copy("C:/Users/okele/Pictures", "C:/Users/okele/Desktop", (progress)=>{
    console.log(progress);
});*/

storageInfo().then((value)=>{
    console.log(value);
}).catch(error => console.error(error));