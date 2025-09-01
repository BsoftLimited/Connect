import { CString, dlopen, FFIType, JSCallback, suffix, type Pointer } from "bun:ffi";
import { homedir } from "os";
import path from 'path';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const libPath = path.join(process.cwd(), `./file-handle/target/release/${process.platform === "linux" ? "libfile_handle" : "file_handle"}.${suffix}`);

const { symbols: { copy_with_progress, get_folder_info, storage_info }} = dlopen(libPath, {
    copy_with_progress: {
        args: [FFIType.cstring, FFIType.cstring, FFIType.function, FFIType.function],
        returns: FFIType.void,
    },
    get_folder_info: {
        args: [FFIType.cstring, FFIType.function, FFIType.function],
        returns: FFIType.void
    },
    storage_info: {
        args: [FFIType.cstring, FFIType.function, FFIType.function],
        returns: FFIType.void
    },
});

interface FolderInfo {
    name: string,
    total_size: number,
    file_count: number,
    folder_count: number,
}

const folderInfo = async( path: string): Promise<FolderInfo> => {
    return new Promise((resolve, reject)=>{
        const callback = new JSCallback((name_ptr: Pointer, folder_count: number, file_count: number, total_size: number) => {
            const name = new CString(name_ptr).toString();

            resolve({ name, total_size, file_count, folder_count });
        }, { args: [FFIType.cstring, FFIType.u32, FFIType.u32, FFIType.u64], returns: FFIType.void});

        const error_callback = new JSCallback((error: Pointer) => {
            const errorStr = new CString(error).toString();
            reject(new Error(errorStr));
        }, { args: [FFIType.cstring], returns: FFIType.void});

        try{
            get_folder_info(Buffer.from(path), callback, error_callback);
        }catch(error){
            reject(error);
        }
    });
}

interface ProgressEvent {
    name: string,
    total_files: number,
    files_copied: number,
    total_bytes: number;
    bytes_copied: number;
    percentage: number;
    completed: boolean;
}

const copy = async( sourcePath: string, destPath: string, onProgress?: (progress: ProgressEvent) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        const callback = new JSCallback((name: Pointer, total_files: number, files_copied: number, total_bytes: number, bytes_copied: number, percentage: number, completed: boolean) => {
            console.log(bytes_copied, total_bytes, percentage, completed);
            if (onProgress) {
                const nameStr = new CString(name).toString();
                onProgress({ name: nameStr, total_files, files_copied,  total_bytes, bytes_copied, percentage, completed });
            }
            if (completed) {
                resolve();
            }
        }, { args: [FFIType.cstring, FFIType.u32, FFIType.u32, FFIType.u64, FFIType.u64, FFIType.f32, FFIType.bool], returns: FFIType.void});

        const error_callback = new JSCallback((error: Pointer) => {
            const errorStr = new CString(error).toString();
            reject(new Error(errorStr));
        }, { args: [FFIType.cstring], returns: FFIType.void});

        try{
            copy_with_progress(Buffer.from(sourcePath), Buffer.from(destPath), callback, error_callback);
        }catch(error){
            reject(error);
        }
    });
}

const storageInfo = async (): Promise<{ name: string, total: number, available: number }> => {
    return new Promise((resolve, reject) => {
        const callback = new JSCallback((name_ptr: Pointer, total: number, available: number) => {
            const name = new CString(name_ptr).toString(); 
            resolve({ name, total, available });
        }, { args: [FFIType.cstring, FFIType.u64, FFIType.u64], returns: FFIType.void});

        const error_callback = new JSCallback((error: Pointer) => {
            const errorStr = new CString(error).toString();
            reject(new Error(errorStr));
        }, { args: [FFIType.cstring], returns: FFIType.void});

        try{
            storage_info(Buffer.from(homedir()), callback, error_callback);
        }catch(error){
            reject(error);
        }
    });
}

export { type ProgressEvent, type FolderInfo, folderInfo, copy, storageInfo };
