import {DataType, define, funcConstructor, open} from "ffi-rs";
import {homedir} from "os";

interface FolderInfo {
    name: string,
    total_size: number,
    file_count: number,
    folder_count: number,
}

interface StorageInfo{
    name: string, total: number, available: number
}

interface CopyProgressEvent {
    name: string,
    total_files: number,
    files_copied: number,
    total_bytes: number;
    bytes_copied: number;
    percentage: number;
}

const library_name = "file-handle";
const { get_folder_info, storage_info, copy_with_progress } = define({
    get_folder_info: {
        library: library_name,
        paramsType: [
            DataType.String,
            funcConstructor({
                paramsType: [ DataType.String, DataType.I32, DataType.I32, DataType.U64 ],
                retType: DataType.Void
            }),
            funcConstructor({ paramsType: [ DataType.String], retType: DataType.Void })
        ],
        retType: DataType.Void,
        runInNewThread: true
    },
    storage_info: {
        library: library_name,
        paramsType: [
            DataType.String,
            funcConstructor({
                paramsType: [ DataType.String, DataType.U64, DataType.U64 ],
                retType: DataType.Void
            }),
            funcConstructor({ paramsType: [ DataType.String], retType: DataType.Void })
        ],
        retType: DataType.Void,
        runInNewThread: true
    },
    copy_with_progress: {
        library: library_name,
        paramsType: [
            DataType.String,
            DataType.String,
            funcConstructor({
                paramsType: [ DataType.String, DataType.I32, DataType.I32, DataType.U64, DataType.U64, DataType.Double ],
                retType: DataType.Void
            }),
            funcConstructor({ paramsType: [ DataType.String], retType: DataType.Void })
        ],
        retType: DataType.Void,
        runInNewThread: true
    }
});

const folderInfo = ( path: string): Promise<FolderInfo> => {
    return new Promise((resolve, reject)=>{
        const callback = (name: string, folder_count: number, file_count: number, total_size: number) => {
            resolve({ name, total_size, file_count, folder_count });
        }

        const error_callback = (error: string) => reject(new Error(error));

        get_folder_info([path, callback, error_callback]).catch((error)=> reject(error));
    });
}

const copy = ( sourcePath: string, destPath: string, onProgress?: (progress: CopyProgressEvent) => void): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const callback = (name: string, total_files: number, files_copied: number, total_bytes: number, bytes_copied: number, percentage: number) => {
            if (onProgress) {
                onProgress({ name, total_files, files_copied,  total_bytes, bytes_copied, percentage });
            }
            if (total_bytes === bytes_copied) {
                console.log("copy completed");
                resolve();
            }
        }

        const error_callback = (error: string) => reject(new Error(error));

        try{
            await copy_with_progress([sourcePath, destPath, callback, error_callback]);

            console.log("copy_with_progress finished processing")
        }catch(error){
            reject(error);
        }
    });
}

const storageInfo = (): Promise<StorageInfo> => {
    return new Promise((resolve, reject) => {
        const callback = (name: string, total: number, available: number) => {
            resolve({ name, total, available });
        }

        const error_callback = (error: string) => reject(new Error(error));

        storage_info([homedir(), callback, error_callback]).catch((error)=> {
            reject(error);
        });
    });
}

export { type CopyProgressEvent, type FolderInfo, folderInfo, copy, storageInfo };
