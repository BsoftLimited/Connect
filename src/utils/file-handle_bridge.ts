import { CString, dlopen, FFIType, JSCallback, suffix, type Pointer } from "bun:ffi";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, `../../file-handle/target/release/file_handle.${suffix}`); // .dll on Windows

const {
    symbols: { copy_file_with_progress, copy_folder_with_progress, get_folder_info },
} = dlopen(libPath, {
    copy_file_with_progress: {
        args: [FFIType.cstring, FFIType.cstring, FFIType.function],
        returns: FFIType.bool,
    },
    copy_folder_with_progress: {
        args: [FFIType.cstring, FFIType.cstring, FFIType.function],
        returns: FFIType.bool,
    },
    get_folder_info: {
        args: [FFIType.cstring], returns: FFIType.cstring
    }
});

interface FolderInfo {
    total_size: number,
    file_count: number,
    folder_count: number,
}

const folderInfo = async( path: string): Promise<FolderInfo> => {
    return new Promise((resolve, reject)=>{
        try{
            const result = get_folder_info(Buffer.from( path));
            if (result) {
                const info: FolderInfo = JSON.parse(result.toString());
                resolve(info);
            }else{
                reject("something went wrong");
            }
        }catch(error){
            reject(error);
        }
    });
}

interface FileProgressEvent {
    bytes_copied: number;
    total_bytes: number;
    percentage: number;
    completed: boolean;
    error?: string;
}

const copyFile = async( sourcePath: string, destPath: string, onProgress?: (progress: FileProgressEvent) => void): Promise<boolean> => {
    return new Promise((resolve) => {
        const callback = new JSCallback((bytes_copied: number, total_bytes: number, percentage: number, completed: boolean, error: string | null) => {
            console.log(bytes_copied, total_bytes, percentage, completed, error);
            if (onProgress) {
                onProgress({ bytes_copied, total_bytes, percentage, completed, error});
            }
            if (completed) {
                resolve(true);
            }else if (error) {
                resolve(false);
            }
        }, { args: [FFIType.u64, FFIType.u64, FFIType.f32, FFIType.bool, FFIType.cstring], returns: FFIType.void});

        const result = copy_file_with_progress( Buffer.from(sourcePath), Buffer.from(destPath), callback);

        if (!result) {
            resolve(false);
        }
    });
}

interface FolderProgressEvent {
    name: string,
    total_files: number,
    files_copied: number,
    total_bytes: number;
    bytes_copied: number;
    percentage: number;
    completed: boolean;
    error?: string;
}

const copyFolder = async( sourcePath: string, destPath: string, onProgress?: (progress: FolderProgressEvent) => void): Promise<boolean> => {
    return new Promise((resolve)=>{
        const callback = new JSCallback((name: Pointer, total_files: number, files_copied: number, total_bytes: number, bytes_copied: number,  percentage: number, completed: boolean, error: Pointer | null) => {
            if (onProgress) {
                const nameStr = new CString(name).toString();
                const errorStr = error ? new CString(error).toString() : undefined;

                onProgress({ name: nameStr, total_files, files_copied, bytes_copied, total_bytes, percentage, completed, error: errorStr});
            }
            if (completed) {
                resolve(true);
            }else if (error) {
                resolve(false);
            }
        }, { args: [ FFIType.cstring, FFIType.u32, FFIType.u32, FFIType.u64, FFIType.u64, FFIType.f32, FFIType.bool, FFIType.cstring], returns: FFIType.void});

        const result = copy_folder_with_progress( Buffer.from(sourcePath), Buffer.from(destPath), callback);

        if (!result) {
            resolve(false);
        }
    });
}

export { type FileProgressEvent, type FolderProgressEvent, type FolderInfo, folderInfo, copyFile, copyFolder };
