import { copy } from "./src/utils/file-handle_bridge";
import {open, close} from "ffi-rs";
import {platform} from "os";
import path from "path";

/*folderInfo("C:/Users/okele/Pictures").then((value)=>{
    console.log(value);
}).catch(error => console.error(error)).finally(()=>{
    console.log("done getting folder info")
});*/

const libPath = path.join(process.cwd(), "./file-handle/target/release", platform() === 'win32' ? 'file_handle.dll' : "libfile_handle.so");
const library_name = "file-handle";

open({ library: library_name, path: libPath });
/*const init = await copy("C:/Users/okele/Downloads/zig-windows-x86_64-0.14.0-dev.3388+e0a955afb.zip", "C:/Users/okele/Videos", (progress)=>{
    console.log(progress);
}).finally(()=>{
    console.log("done copying file");
    close(library_name);
}).catch(error => console.error(error)).then(()=>{
    return 10;
});

console.log(10);*/

/*copy("C:/Users/okele/Pictures", "C:/Users/okele/Desktop", (progress)=>{
    console.log(progress);
});

storageInfo().then((value)=>{
    console.log(value);
}).catch(error => console.error(error)).finally(()=>{
    console.log("done getting storage info")
});*/


const test = (): Promise<void> =>{
    return new Promise((resolve, reject)=>{
        resolve();
    });
}

test().then(()=>{
    console.log("I just finished");
});