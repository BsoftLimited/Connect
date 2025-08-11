import { homedir } from "os";
import { join } from "path";
import { statSync } from "fs";
import { stat } from 'fs/promises';

import { isVideoOrAudio } from "../utils/util";

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
                    if(isVideoOrAudio(name)){
                        files.push({ name, path: join("/streaming", absolutePath), size: stats.size, isDir: false });
                    }else{
                        files.push({ name, path: join("/files", absolutePath), size: stats.size, isDir: false });
                    }
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

    seve = (path: string) => {
        const absolutePath = this.filePath(path);
        
        return Bun.file(absolutePath);
    }

    filePath = (path: string): string =>{
        const absolutePath = join(this.homePath, path);
        console.log(`Saving file at: ${absolutePath}`);

        return absolutePath;
    }

    fileExists = async (path: string): Promise<boolean> => {
        const absolutePath = join(this.homePath, path); 
        console.log(`Checking if file exists at: ${absolutePath}`);

        try {
            const stats = statSync(absolutePath);
            return stats.isFile();
        } catch (error) {
            console.error(`Error checking file existence at ${absolutePath}:`, error);
            return false;
        }
    }

    save = async (path: string, file: File) =>{
        const absolutePath = join(this.homePath, path);

        let finalPath = join(absolutePath, file.name);
        let prefix = 1;
        while(await this.fileExists(finalPath)){
            finalPath = join(absolutePath, `${file.name}-${prefix}`);
            prefix += 1;
        }
        
        await Bun.write(path, finalPath);
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