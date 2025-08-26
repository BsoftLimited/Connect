import { CString, dlopen, FFIType, JSCallback, suffix, type Pointer } from "bun:ffi";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, `./file-handle/target/release/file_handle.${suffix}`); // .dll on Windows

const {
    symbols: { progress_callback, copy_file_with_progress },
} = dlopen(libPath, {
    progress_callback: {
        args: [FFIType.cstring, FFIType.function], // takes a function pointer
        returns: FFIType.void, // returns nothing
    },
    copy_file_with_progress: {
        args: [FFIType.cstring, FFIType.cstring, FFIType.function], // takes a function pointer
        returns: FFIType.bool, // returns a bool
    },
});

const progressCallback = (message: Pointer, percentage: number, done: boolean) => {
    // Assuming update is a pointer to a C string for simplicity
    const msg = new CString(message);
    console.log(msg,percentage, done);
}

const progressInit = new JSCallback(progressCallback, {
    args: [FFIType.cstring, FFIType.f32, FFIType.bool],
    returns: FFIType.void,
});

//progress_callback(Buffer.from("new.txt") , progressInit);
export interface ProgressEvent {
    bytes_copied: number;
    total_bytes: number;
    percentage: number;
    completed: boolean;
    error: string | null;
}
const copyFile = async( sourcePath: string, destPath: string, onProgress?: (progress: ProgressEvent) => void): Promise<boolean> => {
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

export default copyFile;