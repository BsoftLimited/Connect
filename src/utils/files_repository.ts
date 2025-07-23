import { homedir } from "os";
import { join } from "path";
import { statSync } from "fs";

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

    return init[init.length - 1];
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
                    files.push({ name, path: join("/files", absolutePath), size: stats.size, isDir: false });
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
        const absolutePath = join(this.homePath, path);
        console.log(`Saving file at: ${absolutePath}`);

        return Bun.file(absolutePath);
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

    libraries = async(): Promise<DirectoryFile[]> => {
        const files: DirectoryFile[] = [];

        for(const library of FilesRepository.Libraries){
            const absolutePath = join(this.homePath, library);

            const stats = statSync(absolutePath);

            files.push({ name: library, path: absolutePath, size: stats.size, isDir: stats.isDirectory() })
        }

        return files;
    }

    static Libraries = [ "Home", "Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos"]
}

export default FilesRepository;