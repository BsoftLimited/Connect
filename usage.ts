import { copyNative, folderInfo, storageInfo } from "./src/utils/file-handle_bridge";

folderInfo("C:/Users/okele/Pictures").then((value)=>{
    console.log(value);
}).catch(error => console.error(error));

copyNative(" C:/Users/okele/Downloads/zig-windows-x86_64-0.14.0-dev.3388+e0a955afb.zip", " C:/Users/okele/Videos", (progress)=>{
    console.log(progress);
});

/*copy("C:/Users/okele/Pictures", "C:/Users/okele/Desktop", (progress)=>{
    console.log(progress);
});

storageInfo().then((value)=>{
    console.log(value);
}).catch(error => console.error(error));*/