import Elysia, { t } from "elysia";
import FilesRepository from "./utils/files_repository";

const api = new Elysia({ prefix: "/api" });

const fileRepository = new FilesRepository();

api.get("/*", async(req) => {
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const filePath = req.path.replace("/api", "");
    const directory = await fileRepository.get(filePath);

    return new Response(JSON.stringify(directory), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    });
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

    return new Response(JSON.stringify(message), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    });
}, { body: t.Object({ file: t.String(), directory: t.String() }) });

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

        return new Response(JSON.stringify({ message: 'File uploaded successfully', dest, filename: file.name, size: file.size }),{
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            }
        });
    }catch(error){
        console.error(error);
        return new Response("internal server error", { status: 500 });
    }
}, {  });

export { api, fileRepository };