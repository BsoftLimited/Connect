import { homedir } from "os";
import { join } from "path";
import { statSync } from "fs";
import { stat, rm, cp, copyFile, rename as fsRename, mkdir } from 'fs/promises';

export interface DirectoryFile{ 
    name: string, path: string, size: number, isDir: boolean 
}

export interface DirectoryDetails{
    name: string,
    path: string,

    files: DirectoryFile[]
}

const getName = (path: string) =>{
    let init: string[] = [""];

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

    get = async (path: string): Promise<DirectoryDetails> => {
        console.log(`Fetching directory details for path: ${join(this.homePath, path)}`);

        const result = await Bun.$`ls ${join(this.homePath, path)}`.text();

        let folders: DirectoryFile[] = [];
        let files: DirectoryFile[] = [];
        for(const name of result.split('\n').filter(file => file)){
            try {
                const absolutePath = join(path, name);
                console.log(`Processing file: ${absolutePath}`);

                const stats = statSync(join(this.homePath, absolutePath));

                if(stats.isDirectory()){
                    const size = (await Bun.$`ls ${join(this.homePath, absolutePath)}`.text()).split('\n').filter(init => init).length;

                    folders.push({ name, path: absolutePath, size, isDir: true });
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

    home = async (): Promise<DirectoryDetails> => {
        return this.get("/");
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

        return await Bun.file(absolutePath).exists();
    }

    save = async (path: string, file: File) =>{
        const absolutePath = join(this.homePath, path);

        let finalPath = join(absolutePath, file.name);
        let prefix = 1;
        while(await this.fileExists(finalPath, false)){
            const ext = file.name.split('.').pop()?.toLowerCase() ?? "unknown";
            const name = file.name.replace(`.${ext}`, "");
            finalPath = join(absolutePath, `${name}-${prefix}.${ext}`);
            prefix += 1;
        }
        
        console.write(`final name is: ${finalPath}`);
        await Bun.write(finalPath, file, { createPath: true }).catch((error)=>{
            console.error(error);
        }).then((value)=>{
            console.log(`finished saving file: ${file.name} to path: ${absolutePath}`);
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

    copy = async (filePath: string, dest: string) =>{
        await this.initMovement(filePath, dest, async(absoluteFilePath, absoluteDest, isDir) =>{
            if(isDir){
                await cp( absoluteFilePath, absoluteDest , { recursive: true });
            }else{
                await copyFile(absoluteFilePath, absoluteDest);
            }
        });
    }

    move = async (filePath: string, dest: string) =>{
        return await this.initMovement(filePath, dest, async(absoluteFilePath, absoluteDest, isDir) =>{
            await fsRename(absoluteFilePath, absoluteDest);
        });
    }

    rename = async(directory: string, fileName: string, newName: string) =>{
        const absoluteFilePath = join(this.homePath, directory, fileName);
        const absoluteDest = join(this.homePath, directory, newName);

        return await fsRename(absoluteFilePath, absoluteDest);
    }

    createDir = async(directory: string, name: string) =>{
        const absoluteDest = join(this.homePath, directory);

        return await mkdir(join(absoluteDest, name));
    }

    delete = async (path: string, fileName: string) =>{
        const absolutePath = join(this.homePath, path);

        let finalPath = join(absolutePath, fileName);
        console.log(`trying to delete: ${finalPath}`);
        if(await this.fileExists(finalPath, false)){
            // Delete a file
            const stats = statSync(finalPath);
            if(stats.isFile()){
                const file = Bun.file(finalPath);
                console.log(file.name);
                await file.delete().catch((error)=>{
                    console.error(error);
                });
            }else{
                // Delete a directory and all its contents
                await rm(finalPath, { recursive: true, force: true });
            }
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

    static Libraries = [ "Home", "Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos"]
}

export default FilesRepository;