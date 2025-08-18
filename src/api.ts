import Elysia, { t } from "elysia";
import FilesRepository from "./utils/files_repository";

const api = new Elysia({ prefix: "/api" });

const fileRepository = new FilesRepository();

const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

api.get("/*", async(req) => {
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const filePath = req.path.replace("/api", "");
    const directory = await fileRepository.get(filePath);

    return new Response(JSON.stringify(directory), { headers });
});

api.delete("/", async(req) => {
    const file = req.body.file;
    const directory = req.body.directory;

    const { message, status } = await fileRepository.delete(directory, file).then(()=>{
        return {  message: `${file} deletion was successful`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ file: t.String(), directory: t.String() }) });

api.post("/", async(req) => {
    const name = req.body.name;
    const directory = req.body.directory;

    const { message, status } = await fileRepository.createDir(directory, name).then(()=>{
        return {  message: `file:${name} creation in ${directory} was successful`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ name: t.String(), directory: t.String() }) });

api.patch("/move", async(req)=>{
    const { message, status } = await fileRepository.move(req.body.filePath, req.body.dest).then(()=>{
        return {  message: `${req.body.filePath.split("/").pop()} was moved to ${req.body.dest} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
},{ body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/copy", async(req)=>{
    const { message, status } = await fileRepository.copy(req.body.filePath, req.body.dest).then(()=>{
        return {  message: `${req.body.filePath.split("/").pop()} was copied to ${req.body.dest} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/rename", async(req)=>{
    const { message, status } = await fileRepository.rename(req.body.directory, req.body.fileName, req.body.newName).then(()=>{
        return {  message: `${req.body.fileName} was remaned to ${req.body.newName} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ directory: t.String(), fileName: t.String(), newName: t.String() }) });

api.post('/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | undefined;
    const dest = formData.get("dest")?.toString();

    if (!file) {
        return new Response('No file uploaded', { status: 400 });
    }

    if(!dest){
        return new Response("destination folder not specified", { status: 400 });
    }else{
        console.log(`saving file: ${file.name} to path: ${dest}`);
    }

    try{
        await fileRepository.save(dest, file);

        return new Response(JSON.stringify({ message: 'File uploaded successfully', dest, filename: file.name, size: file.size }),{ status: 201, headers });
    }catch(error){
        console.error(error);
        return new Response("internal server error", { status: 500 });
    }
}, {  });



export { api, fileRepository };