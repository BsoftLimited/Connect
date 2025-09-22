import type { User } from "../common";

export const isVideoOrAudio = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? "unknown";
    return ["mp4", "mkv", "avi", "mp3", "wav"].includes(ext);
}

export const isAudio = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? "unknown";
    return ["mp3", "wav"].includes(ext);
}

export const isVideo = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? "unknown";
    return ["mp4", "mkv", "avi"].includes(ext);
}

// funtion to convert bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const htmlBuilder = (config: { title: string, jsFile: string, cssFiles?: string[]}): string => {
    return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>${config.title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" />
                ${config.cssFiles?.map(css => `<link rel="stylesheet" href="/assets/css/${css}" />`).join('') ?? ''}
            </head>
            <body>
                <main id="root"></main>
                <script src="/assets/js/${config.jsFile}"></script>
            </body>
        </html>`;
}

export const formatAccessLevel = (user?: User) =>{
    if(user?.accessLevel === "read-write"){
        return "Read Write";
    }
    return "Read Only";
}

export interface RequestSuccess{ status: number, data: any }
export interface RequestFailed{ status: number, error: any }

export const request = <T>(data: { url:string, input?: T, method?: string }) =>{
    return new Promise<RequestSuccess>(async(reslove, reject) =>{
        const request = new Request(data.url, {
            method: data.method || "GET",
            headers: { 'Content-type': 'application/json'},
            body: JSON.stringify(data.input)
        });

        const response = await fetch(request);
        if (!response.ok) {
            reject({ status: response.status, error: await response.text() });
        }else{
            reslove({ status: response.status, data: await response.json() });
        }
    });
}

export class Dual<T,S>{
    private __first?: T;
    get first(){ return this.__first!; }

    private __second?: S;
    get second(){ return this.__second!; }

    private constructor(first?: T, second?: S){
        this.__first = first;
        this.__second = second;
    }

    get isFirst(){ return  this.__first !== undefined; }
    get isSecond(){ return this.__second !== undefined; }

    static first = <T, S>(value: T): Dual<T, S> => new Dual<T, S>(value, undefined);
    static second = <T, S>(value: S): Dual<T, S> => new Dual<T, S>(undefined, value);
}