import Elysia, { status, t } from "elysia";
import { authPlugin } from "./auth";
import FilesRepository from "./repositories/files_repository";
import type {CopyProgressEvent, DeletePregressEvent} from "./utils/file-handle_bridge.ts";
import type {AccessLevel, FileReport, Role, ThemePreference, User} from "./common.ts";
import { NotificationsRepository } from "./repositories/notification_repository.ts";
import type { ElysiaWS } from "elysia/dist/ws/index";

const api = new Elysia({ prefix: "/api" }).decorate("repository", new FilesRepository()).decorate("notRepository", new NotificationsRepository()).use(authPlugin).derive(async ({ userRepository })=>{
    let admin: User = await userRepository.admin();

    return { admin };
}).state<"adminWS", ElysiaWS|undefined>("adminWS", undefined).derive(({ store }) => ({
        setAdminWS(adminWS: ElysiaWS) {
            store.adminWS = adminWS;
        },
        removeAdminWS(){
            store.adminWS = undefined;
        },
        adminConnected: () => store.adminWS !== undefined
}));

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

api.get("/user", async({ status, session, notRepository }) => {
    try{
        const notifications = await notRepository.all(session?.user.id!);

        return status(200, { ...session, notifications });
    }catch(error){
        return status(503, { message: "internal server error", error });
    }
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

api.patch("/user/config", async({ userRepository, session, body, status })=>{
    try{
        const config = await userRepository.updateConfig({ id: session!.config.id, ...body });
        return status(200, config);
    }catch(error){
        return status(503, JSON.stringify({ message: "user config update failed", error }));
    }
}, { body: t.Object({ imagePreview: t.Optional(t.Boolean()), notifications: t.Optional(t.Boolean()) }) });

api.delete("/", async({ session, body, repository, store, adminConnected, admin, notRepository, status  }) => {
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status( 403, { message: "you are not allowed to delete files" });
    }

    const file = body.file;
    const directory = body.directory;

    const report = async (fileReport: FileReport) => {
        if(session?.user.id !== admin.id){
            const notification = await notRepository.add(admin.id, fileReport.message, fileReport.ntype);
            if(adminConnected()){
                store.adminWS?.send({ operation: "notification", status: 200, notification });
            }
        }
    }

    const { message, code } = await repository.delete({ user: session?.user!, fileName: file, path: directory, report }).then(()=>{
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

api.patch("/move", async({ session, body, admin, store, adminConnected, repository, notRepository, status })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to move files" });
    }

    const report = (fileReport: FileReport) => {
        if(session?.user.id !== admin.id){
            const notification = notRepository.add(admin.id, fileReport.message, fileReport.ntype);
            if(adminConnected()){
                store.adminWS?.send({ operation: "notification", status: 200, notification });
            }
        }
    }

    const { message, code } = await repository.move({ user: session?.user!, filePath: body.filePath, dest: body.dest, report }).then(()=>{
        return {  message: `${body.filePath.split("/").pop()} was moved to ${body.dest} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
},{ body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/copy", async({ session, status, body, adminConnected, store, admin, repository, notRepository })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to copy files" });
    }

    const report = (fileReport: FileReport) => {
        if(session?.user.id !== admin.id){
            const notification = notRepository.add(admin.id, fileReport.message, fileReport.ntype);
            if(adminConnected()){
                store.adminWS?.send({ operation: "notification", status: 200, notification });
            }
        }
    }

    const { message, code } = await repository.copy({ user: session?.user!, filePath: body.filePath, dest: body.dest, report }).then(()=>{
        return {  message: `${body.filePath.split("/").pop()} was copied to ${body.dest} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ filePath: t.String(), dest: t.String() }) });

api.patch("/rename", async({ session, body, admin, adminConnected, store, status, repository, notRepository })=>{
    if(session?.user.role === "guest" || session?.user.accessLevel === "read-only") {
        return status(403, { message: "you are not allowed to rename files" });
    }

    const report = (fileReport: FileReport) => {
        if(session?.user.id !== admin.id){
            const notification = notRepository.add(admin.id, fileReport.message, fileReport.ntype);
            if(adminConnected()){
                store.adminWS?.send({ operation: "notification", status: 200, notification });
            }
        }
    }

    const { message, code } = await repository.rename({ user: session?.user!, directory: body.directory,  fileName: body.fileName, newName: body.newName, report }).then(()=>{
        return {  message: `${body.fileName} was remaned to ${body.newName} successfully`, code: 200 };
    }).catch((error)=>{
        console.error(error);

        return { message: "server error", code: 503 };
    }); 

    return status(code, {message});
}, { body: t.Object({ directory: t.String(), fileName: t.String(), newName: t.String() }) });

api.post('/upload', async ({ request, repository, admin, adminConnected, store, session, notRepository, status }) => {
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

    const report = (fileReport: FileReport) => {
        if(session?.user.id !== admin.id){
            const notification = notRepository.add(admin.id, fileReport.message, fileReport.ntype);
            if(adminConnected()){
                store.adminWS?.send({ operation: "notification", status: 200, notification });
            }
        }
    }

    try{
        await repository.save({ user: session!.user, path: dest, file, report });

        return status(201, { message: 'File uploaded successfully', dest, filename: file.name, size: file.size });
    }catch(error){
        console.error(error);
        return status(500, { message: "internal server error" });
    }
});

api.get("/notification/:id?", async ({ session, params, notRepository })=>{
    try{
        if(params.id){
            const init = await notRepository.get(session?.user.id!, params.id);
            if(init.first){
                return status(200, init.first);
            }
            
             return status(init.second.status, { message: init.second.message });
        }

        const init = await notRepository.all(session?.user.id!); 
        return status(200, init);
    }catch(error){
        console.error(error);
        return status(500, { message: "internal server error" });
    }
});

api.delete("/notification/:id?", async ({ body, params, session, notRepository })=>{
    if(body.id || params.id){
        const id = body.id ?? params.id;
        try{
            const init = await notRepository.delete(session?.user.id!, id!);
            if(init.isFirst){
                return status(200, init.first);
            }

            return status(init.second.status, { message: init.second.message });
        }catch(error){
            console.error(error);
            return status(500, { message: "internal server error" });
        }
    }
    return status(400, { message: "invalid server request" });
}, { body: t.Object({ id: t.Optional(t.String()) }) });

api.patch("/notification/:id?", async ({ body, params, session, notRepository })=>{
    if(body.id || params.id){
        const id = body.id ?? params.id;
        try{
            const init = await notRepository.seen(session?.user.id!, id!);
            if(init.isFirst){
                return status(200, init.first);
            }

            return status(init.second.status, { message: init.second.message });
        }catch(error){
            console.error(error);
            return status(500, { message: "internal server error" });
        }
    }
    return status(400, { message: "invalid server request" });
}, { body: t.Object({ id: t.Optional(t.String()) }) });

api.ws("/process", {
    body: t.Object({ operation: t.String(), data: t.Object({
        path: t.Optional(t.String()), file: t.Optional(t.String()),
        filePath: t.Optional(t.String()), destination: t.Optional(t.String())
    }) }),
    open(ws) {
        console.log(`user: ${ws.id} has connected to websocket for processes`);
    },
    close(ws, code, reason) {
        console.log(`user: ${ws.id} has left for processes with code: ${code} and reason: ${reason}`);
    },
    message: async (ws, message) => {
        if(ws.data.session?.user){
            const report = (fileReport: FileReport) => {
                if(ws.data.session?.user.id !== ws.data.admin.id){
                    const notification = ws.data.notRepository.add(ws.data.admin.id, fileReport.message, fileReport.ntype);
                    if(ws.data.adminConnected()){
                        ws.data.store.adminWS?.send({ operation: "notification", status: 200, notification });
                    }
                }
            }

            if(message.operation === "copy"){
                if(ws.data.session.user.role === "guest" || ws.data.session.user.accessLevel === "read-only") {
                    ws.send({ message: `you are not allowed to ${message.operation} files`, status: 401, operation: message.operation });
                }else{
                    const onProcess = (progress: CopyProgressEvent) =>{
                        console.log(progress);
                        ws.send({ message: "copying", operation: "copy", progress, status: 200 });
                    }

                    console.log(message);
                    const result = await api.decorator.repository.copy({ user: ws.data.session.user, filePath: message.data.filePath!, dest: message.data.destination!, onProcess, report }).then(()=>{
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

                //, 
                const result = await api.decorator.repository.delete({ user: ws.data.session.user, path: message.data.path!, fileName: message.data.file!, onProcess, report }).then(()=>{
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

api.ws("/notifications", {
    open(ws) {
        console.log(`user: ${ws.id} has connected to websocket for notifications`);
        if(ws.data.session?.user.id === ws.data.admin.id){
            ws.data.setAdminWS(ws);
        }
    },
    close(ws, code, reason) {
        console.log(`user: ${ws.id} has left for notifications with code: ${code} and reason: ${reason}`);
        if(ws.data.session?.user.id === ws.data.admin.id){
            ws.data.removeAdminWS();
        }
    },
    message: async (ws, message) => {},
});

export default  api;