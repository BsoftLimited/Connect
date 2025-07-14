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
        const result = await Bun.$`ls ${join(this.homePath, path)}`.text();

        const files: DirectoryFile[] = [];
        for(const name of result.split('\n').filter(file => file)){
            const absolutePath = join(path, name);

            const stats = statSync(join(this.homePath, absolutePath));

            if(stats.isDirectory()){
                const size = (await Bun.$`ls ${join(this.homePath, absolutePath)}`.text()).split('\n').filter(init => init).length;

                files.push({ name, path: absolutePath, size, isDir: true });
            }else{
                files.push({ name, path: join("/files", absolutePath), size: stats.size, isDir: false });
            }
        }

        const name = path === "/" ? "Home" : getName(path);

        return { name, path, files };
    }

    home = async (): Promise<DirectoryDetails> => {
        return this.get("/");
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

    static Libraries = [ "Desktop", "Documents", "Downloads", "Musics", "Pictures"]
}

export default FilesRepository;