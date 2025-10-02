import Elysia, { t } from "elysia";
import { authPlugin } from "./auth";
import FilesRepository from "./repositories/files_repository";
import type {CopyProgressEvent, DeletePregressEvent} from "./utils/file-handle_bridge.ts";
import type {AccessLevel, Role, ThemePreference} from "./common.ts";

const api = new Elysia({ prefix: "/api" }).decorate("repository", new FilesRepository()).use(authPlugin);

api.onBeforeHandle(async ({ session, status }) => {
    if (!session) {
        return status(401, { message: "Unauthorized access" });
    }
});

api.get("/*", async({ path, repository, status, session }) => {
    if (path.includes('%20')) {
        path = decodeURIComponent(path);
    }
    const filePath = path.replace("/api", "");
    const directory = await repository.get(session!.user, filePath);

    return status(200, directory);
});

api.get("/user", async({ status, session }) => {
    return status(200, session);
});

api.get("/users", async({ session, userRepository, status }) => {
    if(session?.user.role === "admin"){
        const users = await userRepository.users();
        
        return status(200, users);
    }else{
        return status(401, { message: "you are not allowed to view users" });
    }
});

api.post("/user", async({ userRepository, session, body, status })=>{
    if(session?.user.role === "admin"){
        try{
            const result = await userRepository.create({ ...body, 
                accessLevel: body.accessLevel as AccessLevel | "read-only",
                role: body.role as ("user" | "guest") || "guest"
            });

            if(result.isFirst){
                return status(201, result.first);
            }else{
                const error = result.second;

                return status(401, { message: "Form validation failed", error });
            }
        }catch(error){
            return status(400, { message: "User resgistration failed", error });
        }
    }
    return status(401, JSON.stringify({ message: "you are not allowed to create user" }));
}, { body: t.Object({ email: t.String(), username: t.String(), accessLevel: t.String(), role: t.String() }) });

api.delete("/user", async({ session, body, userRepository, status })=>{
    if(session?.user.role === "admin"){
        try{
            const user = await userRepository.delete(body.id);

            return status(200, user);
        }catch(error){
            return status(400, { message: "user deletion failed", error });
        }
    }
    return status(401, { message: "you are not allowed to delete user" });
}, { body: t.Object({ id: t.String() }) });

api.patch("/user", async({ userRepository, body, session, status })=>{
    try{
        const user = await userRepository.update({ ...body, id: session!.user.id });

        return status(200, user);
    }catch(error){
        return status(503, { message: "user update failed", error });
    }
}, { body: t.Object({ email: t.Optional(t.String()), username: t.Optional(t.String()) }) });

api.patch("/user/access", async({ session, userRepository, body, status })=>{
    if(session?.user.role === "admin"){
        try{
            const result = await userRepository.update({ ...body, 
                role: body.role as Role ?? "guest", 
                accessLevel: body.accessLevel as AccessLevel ?? "read-only" });

            if(result.isFirst){
                return status(200, result.first);
            }
            return status(400, result.second);
        }catch(error){
            return status(503, { message: "user update failed", error });
        }
    }else{
        return status(401, { message: "you are not allowed to update user" });
    }
}, { body: t.Object({ id: t.String(), accessLevel: t.Optional(t.String()), role: t.Optional(t.String()) }) });

api.post("/user/password", async({userRepository, body, status, session})=>{
    try{
        const user = await userRepository.createPassword({ ...body, id: session!.user.id });

        return status(201, user);
    }catch(error){
        return status(503, { message: "password creation failed", error });
    }
}, { body: t.Object({ password: t.String() }) });

api.patch("/user/password", async({userRepository, body, status, session})=>{
    try{
        const result = await userRepository.changePassword({ ...body, id: session!.user.id });
        if(result.isFirst){
            return status(200, result.first);
        }
        return status(400, result.second);
    }catch(error){
        return status(503, { message: "user update failed", error });
    }
}, { body: t.Object({ oldPassword:t.String(), newPassword: t.String() }) });

api.patch("/user/theme", async({ userRepository, session, body, status })=>{
    try{
        const config = await userRepository.updateConfig({ id: session!.config.id, theme: body.theme as ThemePreference || "light" });
        return status(200, config);
    }catch(error){
        return status(503, JSON.stringify({ message: "user config update failed", error }));
    }
}, { body: t.Object({ theme: t.String() }) });

api.delete("/", async({ session, body, repository, status  }) => {
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status( 403, { message: "you are not allowed to delete files" });
    }

    const file = body.file;
    const directory = body.directory;

    const { message, code } = await repository.delete(directory, file).then(()=>{
        return {  message: `${file} deletion was successful`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ file: t.String(), directory: t.String() }) });

api.post("/", async({ session, body, repository, status }) => {
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to create files" });
    }

    const name = body.name;
    const directory = body.directory;

    const { message, code } = await repository.createDir(directory, name).then(()=>{
        return {  message: `file:${name} creation in ${directory} was successful`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ name: t.String(), directory: t.String() }) });

api.patch("/move", async({ session, body, repository, status })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to move files" });
    }

    const { message, code } = await repository.move(body.filePath, body.dest).then(()=>{
        return {  message: `${body.filePath.split("/").pop()} was moved to ${body.dest} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
},{ body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/copy", async({ session, status, body, repository })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to copy files" });
    }

    const { message, code } = await repository.copy(body.filePath, body.dest, undefined).then(()=>{
        return {  message: `${body.filePath.split("/").pop()} was copied to ${body.dest} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/rename", async({ session, body, status, repository })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to rename files" });
    }

    const { message, code } = await repository.rename(body.directory, body.fileName, body.newName).then(()=>{
        return {  message: `${body.fileName} was remaned to ${body.newName} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ directory: t.String(), fileName: t.String(), newName: t.String() }) });

api.post('/upload', async ({ request, repository, session, status }) => {
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to upload files" });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | undefined;
    const dest = formData.get("dest")?.toString();

    if (!file) {
        return status(400, { message: "no file was attached" });
    }

    if(!dest){
        return status(400, { message: "no destination was specified" });
    }else{
        console.log(`saving file: ${file.name} to path: ${dest}`);
    }

    try{
        await repository.save(dest, file);

        return status(201, { message: 'File uploaded successfully', dest, filename: file.name, size: file.size });
    }catch(error){
        console.error(error);
        return status(500, { message: "internal server error" });
    }
});

api.ws("/process", {
    body: t.Object({ operation: t.String(), data: t.Object({
        path: t.Optional(t.String()), file: t.Optional(t.String()),
        filePath: t.Optional(t.String()), destination: t.Optional(t.String())
    }) }),
    open({ id, data }) {
        console.log(`user: ${id} has connected to websocket`);
        console.log(`user `, data.session?.user);
    },
    close(ws, code, reason) {
        console.log(`user: ${ws.id} has left with code: ${code} and reason: ${reason}`);
    },
    message: async (ws, message) => {
        if(ws.data.session?.user){
            if(message.operation === "copy"){
                if(ws.data.session.user.role === "guest" || ws.data.session.user.accessLevel === "read-only") {
                    ws.send({ message: `you are not allowed to ${message.operation} files`, status: 401, operation: message.operation });
                }else{
                    const onProcess = (progress: CopyProgressEvent) =>{
                        console.log(progress);
                        ws.send({ message: "copying", operation: "copy", progress, status: 200 });
                    }

                    console.log(message);
                    const result = await api.decorator.repository.copy(message.data.filePath!, message.data.destination!, onProcess).then(()=>{
                        return {  message: `${message.data.filePath!.split("/").pop()} was copied to ${message.data.destination} successfully`,  operation: "copy", completed: true, status: 200 };
                    }).catch((error)=>{
                        console.error(error);
                        return { message: "server error", operation: "copy", error, status: 503 };
                    }); 
                    ws.send(result);
                }
            }else if(message.operation === "delete"){
                console.log(message);

                const onProcess = (progress: DeletePregressEvent) =>{
                    console.log(progress);
                    ws.send({ message: "deleting", operation: "delete", progress, status: 200 });
                }

                const result = await api.decorator.repository.delete(message.data.path!, message.data.file!, onProcess).then(()=>{
                    return {  message: `${message.data.file} was deleted from ${message.data.path!.split("/").pop()} successfully`, operation: "delete", completed: true, status: 200 };
                }).catch((error)=>{
                    console.error(error);
                    return { message: "server error", operation: "delete", error, status: 503 };
                });
                ws.send(result);
            }
        }else{
            ws.send({ message: "access denied, try signing in", operation: message.operation, status: 401 });
        }
    },
});

export default  api;