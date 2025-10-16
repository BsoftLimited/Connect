import { Elysia, status, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import api from "./api";
import { htmlBuilder } from "./utils/util";
import { seed } from "./config";
import auth, { sitePlugin } from "./auth";


const app = new Elysia().use(auth).use(api);
app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

app.use(sitePlugin).get('/files/*',  async ({ session, repository, path, config, status }) => {
     if(session?.user){
        try{
            const { filePath, stats } = await repository.process(path, "/files");

            const ext = filePath.split('.').pop()?.toLowerCase() ?? "unknown";
            const headers: Record<string, string> = {
                'Content-Length': stats.size.toString(),
                'Content-Disposition': `inline; filename="${filePath.split('/').pop() || 'file'}"`,
            };

            if(["mp4", "mkv", "avi"].includes(ext)) {
                headers['Content-Type'] = 'video/mp4';
                headers['Accept-Ranges'] = 'bytes';

                return new Response(repository.serve(filePath), { headers });
            }else if (["mp3", "wav"].includes(ext)) {
                headers['Content-Type'] = 'audio/mpeg';
                headers['Accept-Ranges'] = 'bytes';

                return new Response(repository.serve(filePath), { headers });
            }

            if(session.user.role === "guest" && config?.allowGuestDownload !== true){
                return new Response('you are not allowed to preview files', { status: 403 });
            }

            if (["pdf", "docx", "xlsx"].includes(ext)) {
                headers['Content-Type'] = 'application/pdf';
            } else if (ext === 'txt') {
                headers['Content-Type'] = 'text/plain';
            } else if (["zip", "rar", "gz"].includes(ext)) {
                headers['Content-Type'] = 'application/zip';
                headers['Accept-Ranges'] = 'bytes';
            }else if (["jpg", "png", "gif", "webp"].includes(ext)) {
                headers['Content-Type'] = `image/${ext}`;
            }else {
                headers['Content-Type'] = 'application/octet-stream';
            }

            return new Response(repository.serve(filePath), { headers });
        }catch(error){
            console.error(error);
            return status(404, { message: 'File not found' });
        }
    }else{
        return status(401, { message: 'Unauthorized access' });
    }
});

app.use(sitePlugin).get('/download/*',  async ({ session, config, repository, path, status }) => {
    if(session?.user && (session.user.role !== "guest" || config?.allowGuestDownload === true)){
        try{
            const { filePath, stats } = await repository.process(path, "/download");

            return new Response(repository.serve(filePath), {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
                    'Content-Length': stats.size.toString(),
                    'Accept-Ranges': 'bytes',
                },
            });
        }catch(error){
            console.error(error);
            return status(404, { message: 'File not found' });
        }
    }else{
        return status(401, { message: 'Unauthorized access' });
    }
});

const pageHeaders: HeadersInit = {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

app.use(sitePlugin).get("/*", async ({ session, config }) => {
    let html = (session && session.user.initialized) ?
        htmlBuilder({ title: `${config?.siteName} | App`, jsFile: "index.js", cssFiles: ["app.css", "streaming.css", "account.css"] }) :
        htmlBuilder({ title: `${config?.siteName} | SIgnin`, jsFile: "signin.js", cssFiles: ["app.css", "login.css"]});

    return new Response(html, { headers: pageHeaders });
});

app.get('/favicon.ico', async ({ status }) => {
    const filePath = `./public/favicon.ico`;

    try {
        const file = Bun.file(filePath)
        if (await file.exists()) {
            return new Response(file)
        }
        return status(404, { message: 'Not found' });
    } catch (error) {
        return status(400, { message: 'Bad request' });
    }
});

app.use(sitePlugin).get("/config", async({ config, status }) =>{
    if(config){
        return status(200, config);
    }else{
        return status(503, { message: "Configuration not found" });
    }
}).patch("/config", async ({ status, body, config, session,configRepository  })=>{
    if(session?.user.role === "admin"){
        try{
            const result = await configRepository.update(config?.id!, body);
            return status(200, result);
        }catch(error){
            console.error("updating site config exception: ", error);
            return status(503, { message: "internal server error" });
        }
    }
    return status(401, { message: "only admins is allowed to update site settings" });
}, { body: t.Object({ maintenanceMode: t.Optional(t.Boolean()), allowGuestSignup: t.Optional(t.Boolean()), allowGuestDownload: t.Optional(t.Boolean()) }) });

seed().then(()=>{
    app.listen(3000, (details)=>{
        console.log(details);
        console.log(`🦊 Elysia is running at ${details?.hostname}:${details?.port}`);
    });
}).catch((error)=>{
    console.error("seeding error: ", error);
});