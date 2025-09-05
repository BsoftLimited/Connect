import Elysia, { t, sse } from "elysia";
import { authPlugin } from "./auth";
import FilesRepository from "./repositories/files_repository";
import type { ElysiaWS } from "elysia/dist/ws";

const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

const wsClients = new Map<string, ElysiaWS>();

const api = new Elysia({ prefix: "/api" }).decorate("repository", new FilesRepository()).use(authPlugin);
api.onBeforeHandle(async ({ user, status }) => {
    if (!user) {
        return status(401, 'unauthorized to use the API');
    }
});

api.get("/*", async(req) => {
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const filePath = req.path.replace("/api", "");
    const directory = await req.repository.get(filePath);

    return new Response(JSON.stringify(directory), { headers });
});

api.get("/user", async(req) => {
    return new Response(JSON.stringify(req.user), { headers });
});

api.post("/user", async(req)=>{
    if(req.user?.role === "admin"){
        try{
            const user = await req.userRepository.create({ ...req.body, accessLevel: req.body.accessLevel === "read-write" ? "read-write" : "read-only" });

            return new Response(JSON.stringify(user), { headers });
        }catch(error){
            return new Response(JSON.stringify({ message: "user resgistration failed", error }), { headers, status: 400 });
        }
    }
    return new Response("you are not allowed to create user", { status: 401 });
}, { body: t.Object({ email: t.String(), username: t.String(), accessLevel: t.String(), password: t.String() }) });

api.delete("/user", async(req)=>{
    if(req.user?.role === "admin"){
        try{
            const user = await req.userRepository.delete(req.body.id);

            return new Response(JSON.stringify(user), { headers });
        }catch(error){
            return new Response(JSON.stringify({ message: "user deletion failed", error }), { headers, status: 400 });
        }
    }
    return new Response("you are not allowed to create user", { status: 401 });
}, { body: t.Object({ id: t.String() }) });

api.patch("/user", async(req)=>{
    try{
        const user = await req.userRepository.update({ ...req.body, id: req.user!.id, accessLevel: req.body.accessLevel === "read-write" ? "read-write" : "read-only" });

        return new Response(JSON.stringify(user), { headers });
    }catch(error){
        return new Response(JSON.stringify({ message: "user update failed", error }), { headers, status: 400 });
    }
}, { body: t.Object({ email: t.Optional(t.String()), username: t.Optional(t.String()), accessLevel: t.Optional(t.String()) }) });

api.patch("/user/password", async(req)=>{
    try{
        const user = await req.userRepository.changePassword({ ...req.body, id: req.user!.id });

        return new Response(JSON.stringify(user), { headers });
    }catch(error){
        return new Response(JSON.stringify({ message: "user update failed", error }), { headers, status: 400 });
    }
}, { body: t.Object({ oldPassword:t.String(), newPassword: t.String() }) });

api.delete("/", async(req) => {
    if( req.user?.accessLevel === "read-only") {
        return new Response("you are not allowed to delete files", { status: 403 });
    }

    const file = req.body.file;
    const directory = req.body.directory;

    const { message, status } = await req.repository.delete(directory, file).then(()=>{
        return {  message: `${file} deletion was successful`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ file: t.String(), directory: t.String() }) });

api.post("/", async(req) => {
    if( req.user!.accessLevel === "read-only") {
        return new Response("you are not allowed to create files", { status: 403 });
    }

    const name = req.body.name;
    const directory = req.body.directory;

    const { message, status } = await req.repository.createDir(directory, name).then(()=>{
        return {  message: `file:${name} creation in ${directory} was successful`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ name: t.String(), directory: t.String() }) });

api.patch("/move", async(req)=>{
    if( req.user?.accessLevel === "read-only") {
        return new Response("you are not allowed to move files", { status: 403 });
    }

    const { message, status } = await req.repository.move(req.body.filePath, req.body.dest).then(()=>{
        return {  message: `${req.body.filePath.split("/").pop()} was moved to ${req.body.dest} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
},{ body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/copy", async(req)=>{
    if( req.user!.accessLevel === "read-only") {
        return new Response("you are not allowed to copy files", { status: 403 });
    }

    const { message, status } = await req.repository.copy(req.body.filePath, req.body.dest).then(()=>{
        return {  message: `${req.body.filePath.split("/").pop()} was copied to ${req.body.dest} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/rename", async(req)=>{
    if( req.user!.accessLevel === "read-only") {
        return new Response("you are not allowed to rename files", { status: 403 });
    }

    const { message, status } = await req.repository.rename(req.body.directory, req.body.fileName, req.body.newName).then(()=>{
        return {  message: `${req.body.fileName} was remaned to ${req.body.newName} successfully`, status: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", status: 503 };
    }); 

    return new Response(JSON.stringify(message), { status, headers });
}, { body: t.Object({ directory: t.String(), fileName: t.String(), newName: t.String() }) });

api.post('/upload', async ({ request, repository, user }) => {
    if( user?.accessLevel === "read-only") {
        return new Response("you are not allowed to upload files", { status: 403 });
    }

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
        await repository.save(dest, file);

        return new Response(JSON.stringify({ message: 'File uploaded successfully', dest, filename: file.name, size: file.size }),{ status: 201, headers });
    }catch(error){
        console.error(error);
        return new Response("internal server error", { status: 500 });
    }
});

api.ws("/", {
    body: t.String(),
    open(ws) {
        
        console.log(`user: ${ws.id} has connected to websocket`);
    },
    close(ws, code, reason) {
        console.log(`user: ${ws.id} has left with code: ${code} and reason: ${reason}`);
    },
    message(ws, message) {
        
    },
    
});

export default  api;