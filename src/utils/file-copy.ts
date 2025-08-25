import { dlopen, FFIType, suffix } from "bun:ffi";

import path from 'path';
import { fileURLToPath } from 'url';

// Get the path to the compiled Rust library
// `suffix` is either "dylib", "so", or "dll" depending on the platform
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, `../../target/release/file_handle.${suffix}`); // .dll on Windows

// Define the FFI interface
/*interface ProgressEvent {
  bytes_copied: number;
  total_bytes: number;
  percentage: number;
  completed: boolean;
  error: string | null;
}

type CopyCallback = (event: ProgressEvent) => void;

// Load the Rust library
const lib = ffi.Library(libPath, {
  copy_file_with_progress: ['bool', ['string', 'string', 'pointer']],
});*/

const {
  symbols: {
    add, // the function to call
  },
} = dlopen(libPath, {
  add: {
    args: [FFIType.u64, FFIType.u64], // no arguments
    returns: FFIType.u64, // returns a string
  },
});

console.log('3 + 5 =', add(3, 5)); // should print "Hello from Rust!"

/*export class FileCopier {
  static async copyFile(
    sourcePath: string,
    destPath: string,
    onProgress?: (progress: ProgressEvent) => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // Create callback function
      const callback = ffi.Callback('void', ['pointer'], (eventPtr: any) => {
        const event: ProgressEvent = {
          bytes_copied: eventPtr.bytes_copied,
          total_bytes: eventPtr.total_bytes,
          percentage: eventPtr.percentage,
          completed: eventPtr.completed,
          error: eventPtr.error ? ffi.readCString(eventPtr.error) : null,
        };

        if (onProgress) {
          onProgress(event);
        }

        if (event.completed) {
          resolve(!event.error);
        }
      });

      // Call the Rust function
      const success = lib.copy_file_with_progress(
        sourcePath,
        destPath,
        callback
      );

      if (!success) {
        resolve(false);
      }
    });
  }
}*/