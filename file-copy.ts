import { CString, dlopen, FFIType, JSCallback, suffix, type Pointer } from "bun:ffi";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, `./file-handle/target/release/file_handle.${suffix}`); // .dll on Windows

const {
    symbols: { progress_callback },
} = dlopen(libPath, {
    progress_callback: {
        args: [FFIType.cstring, FFIType.function], // takes a function pointer
        returns: FFIType.void, // returns nothing
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

progress_callback(Buffer.from("new.txt") , progressInit);