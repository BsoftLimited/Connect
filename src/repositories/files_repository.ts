import { homedir } from "os";
import { join } from "path";
import { statSync } from "fs";
import { stat, rm, rename as fsRename, mkdir } from 'fs/promises';
import { copy, deleteFile, type CopyProgressEvent, type DeletePregressEvent } from "../utils/file-handle_bridge";
import type { FileReport, User } from "../common";
import { report } from "process";
import { fileName } from "../utils/util";

export interface DirectoryFile{ 
    name: string, path: string, size?: number, fileCount?: number, folderCount?: number, isDir: boolean 
}

export interface DirectoryDetails{
    name: string,
    path: string,
    files: DirectoryFile[]
}

const getName = (path: string) =>{
    let init: string[];

    if(path.includes("/")){
        init = path.split("/");
    }else{
        init = path.split("\\");
    }

    return init[init.length - 1]!;
}

class FilesRepository{
    homePath: string;

    constructor(){
        this.homePath = homedir();
    }

    get = async (user: User, path: string): Promise<DirectoryDetails> => {
        //console.log(`Fetching directory details for path: ${join(this.homePath, path)}`);

        let result: string[];
        if(user.role === "guest" && (path === "/" || path === "\\")){
            result = FilesRepository.Libraries;
        }else{
            result = (await Bun.$`ls ${join(this.homePath, path)}`.text()).split('\n').filter(file => file);
        }

        let folders: DirectoryFile[] = [];
        let files: DirectoryFile[] = [];
        for(const name of result){
            try {
                const absolutePath = join(path, name);
                //console.log(`Processing file: ${absolutePath}`);

                const stats = statSync(join(this.homePath, absolutePath));

                if(stats.isDirectory()){
                    let fileCount = 0;
                    let folderCount = 0;

                    (await Bun.$`ls ${join(this.homePath, absolutePath)}`.text()).split('\n').filter(init => init).forEach((init)=>{
                        const subStats = statSync(join(this.homePath, absolutePath, init));

                        if(subStats.isDirectory()){
                            folderCount += 1;
                        }else{
                            fileCount += 1
                        }
                    });

                    folders.push({ name, path: absolutePath, fileCount, folderCount, isDir: true });
                }else{
                    files.push({ name, path: absolutePath, size: stats.size, isDir: false });
                }
            }catch (error) {
                console.error(`Error processing file ${name} in path ${path}:`, error);
            }
        }

        const name = path === "/" ? "Home" : getName(path);

        folders = folders.sort((a, b)=> a.name.localeCompare(b.name));
        files = files.sort((a, b)=> a.name.localeCompare(b.name));

        return { name, path, files: [...folders, ...files] };
    }

    serve = (path: string) => {
        const absolutePath = this.filePath(path);
        
        return Bun.file(absolutePath);
    }

    filePath = (path: string): string =>{
        const absolutePath = join(this.homePath, path);
        console.log(`Saving file at: ${absolutePath}`);

        return absolutePath;
    }

    fileExists = async (path: string, relative: boolean = true): Promise<boolean> => {
        console.log(`Checking if file exists at: ${path}`);
        const absolutePath = relative ? join(this.homePath, path) : path;

        const file = Bun.file(absolutePath);
        return await file.exists() || (await file.stat()).isDirectory();
    }

    save = async (input: { user: User, path: string, file: File, report?: (fileReport: FileReport) =>void }) =>{
        const absolutePath = join(this.homePath, input.path);

        let finalPath = join(absolutePath, input.file.name);
        let prefix = 1;
        while(await this.fileExists(finalPath, false)){
            const ext = input.file.name.split('.').pop()?.toLowerCase() ?? "unknown";
            const name = input.file.name.replace(`.${ext}`, "");
            finalPath = join(absolutePath, `${name}-${prefix}.${ext}`);
            prefix += 1;
        }
        
        console.write(`final name is: ${finalPath}`);
        await Bun.write(finalPath, input.file, { createPath: true }).catch((error)=>{
            console.error(error);
        }).then(()=>{
            console.log(`finished saving file: ${input.file.name} to path: ${absolutePath}`);
            if(input.report){
                input.report({ message: `${input.user.username} uploaded file: ${input.file.name} to path: ${absolutePath}`, ntype: "info" });
            }
        });
    }

    initMovement = async (filePath: string, dest: string, process: (path: string, dest: string, isDir: boolean) => Promise<void>) =>{
        const absoluteFilePath = join(this.homePath, filePath);
        const absoluteDest = join(this.homePath, dest);
        const fileName = filePath.replaceAll('\\', '/').split('/').pop()!;
        
        let destFilePath = join(absoluteDest, fileName);
        let prefix = 1;
        
        const stats = statSync(absoluteFilePath);
        if(stats.isFile()){
            while(await Bun.file(destFilePath).exists()){
                const ext = fileName.split('.').pop()?.toLowerCase() ?? "";
                const name = fileName.replace(`.${ext}`, "");
                destFilePath = join(absoluteDest, `${name}-${prefix}.${ext}`);
        
                prefix += 1;
            }
            await process(absoluteFilePath, destFilePath, false);
        }else{
            while(await Bun.file(destFilePath).exists()){
                destFilePath = join(absoluteDest, `${fileName}-${prefix}`);
                prefix += 1;
            }
            await process( absoluteFilePath, destFilePath , true);
        }
    }

    copy = async (input: { user: User, filePath: string, dest: string, onProcess?: (progress: CopyProgressEvent)=>void, report?: (fileReport: FileReport) =>void }) =>{
        const absoluteFilePath = join(this.homePath, input.filePath);
        const absoluteDest = join(this.homePath, input.dest);

        console.log(`file to copied:${absoluteFilePath}`);
        console.log(`file destination:${absoluteDest}`);

        await copy(absoluteFilePath, absoluteDest, input.onProcess).then(()=>{
            if(input.report){
                input.report({ message: `${input.user.username} copied file: ${fileName(input.filePath!)} to path: ${input.dest}`, ntype: "info" });
            }
        });
    }

    move = async (input: { user: User, filePath: string, dest: string, report?: (fileReport: FileReport) =>void }) =>{
        await this.initMovement(input.filePath, input.dest, async(absoluteFilePath, absoluteDest) =>{
            await fsRename(absoluteFilePath, absoluteDest);
        }).then(()=>{
            if(input.report){
                input.report({ message: `${input.user.username} moved file: ${fileName(input.filePath!)} to path: ${input.dest}`, ntype: "important" });
            }
        });
    }

    rename = async(input: { user: User, directory: string, fileName: string, newName: string, report?: (fileReport: FileReport) =>void }) =>{
        const absoluteFilePath = join(this.homePath, input.directory, input.fileName);
        const absoluteDest = join(this.homePath, input.directory, input.newName);

        return await fsRename(absoluteFilePath, absoluteDest).then(()=>{
            if(input.report){
                input.report({ message: `${input.user.username} remaned file: ${input.fileName} to ${input.newName}`, ntype: "important" });
            }
        });
    }

    createDir = async(directory: string, name: string) =>{
        const absoluteDest = join(this.homePath, directory);

        return await mkdir(join(absoluteDest, name));
    }

    delete = async (input: { user: User, path: string, fileName: string, onProcess?: (event: DeletePregressEvent) => void, report?: (fileReport: FileReport) =>void }) =>{
        const absolutePath = join(this.homePath, input.path);

        let finalPath = join(absolutePath, input.fileName);
        console.log(`trying to delete: ${finalPath}`);
        if(await this.fileExists(finalPath, false)){
            await deleteFile(finalPath, input.onProcess).then(()=>{
                if(input.report){
                    input.report({ message: `${input.user.username} deleted file: ${input.fileName}`, ntype: "important" });
                }
            });
        }
    }

    libraries = async(): Promise<DirectoryFile[]> => {
        const files: DirectoryFile[] = [];

        for(const library of FilesRepository.Libraries){
            const absolutePath = join(this.homePath, library);

            const stats = statSync(absolutePath);

            files.push({ name: library, path: absolutePath, size: stats.size, isDir: stats.isDirectory() })
        }

        return files;
    }

    process = async(path: string, endpoint: string = "/files") =>{
        console.log(`Request path: ${path}`);
        if (path.includes('%20')) {
            path = decodeURIComponent(path)
        }
        
        try{
            const filePath = path.replace(endpoint, "");
            if(await this.fileExists(filePath)){
                const absolutePath = this.filePath(filePath);
                const stats = await stat(absolutePath);

                return { filePath, stats };
            }else{
                return Promise.reject(`${filePath} not found`);
            }
        }catch(error){
            return Promise.reject(error);
        }
    }

    static Libraries = [  "Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos"]
}

export default FilesRepository;