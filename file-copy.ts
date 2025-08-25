import { CFunction, CString, dlopen, FFIType, ptr, suffix, type Pointer } from "bun:ffi";
import ffi from "bun:ffi";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, `./file-handle/target/release/file_handle.${suffix}`); // .dll on Windows


const {
    symbols: { add, hello, with_callback, progress_callback },
} = dlopen(libPath, {
    add: {
        args: [FFIType.i32, FFIType.i32], // no arguments
        returns: FFIType.i32, // returns a string
    },
    hello: {
        args: [], // no arguments
        returns: FFIType.cstring, // returns a string
    },
    with_callback: {
        args: [FFIType.function], // takes a function pointer
        returns: FFIType.void, // returns nothing
    },
    progress_callback: {
        args: [FFIType.function], // takes a function pointer
        returns: FFIType.void, // returns nothing
    },
});

console.log('3 + 5 =', add(3, 5));
const greeting = hello();
console.log(greeting);


// Create the callback function
const callback = (msgPtr: Pointer) => {
   const msg = new CString(msgPtr);
   
   console.log("Callback from Rust:", msg.toString());
};

const init = new ffi.JSCallback(callback, {
    args: [FFIType.cstring],
    returns: FFIType.void,
});

with_callback(init);

const progressCallback = (percentage: number, done: boolean) => {
    // Assuming update is a pointer to a C string for simplicity
    //const msg = new CString(update);
    console.log("Progress update from Rust:",percentage, done);
}

const progressInit = new ffi.JSCallback(progressCallback, {
    args: [FFIType.f32, FFIType.bool],
    returns: FFIType.void,
});
progress_callback(progressInit);