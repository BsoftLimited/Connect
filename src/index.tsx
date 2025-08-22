import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import api from "./api";
import { htmlBuilder } from "./utils/util";


const app = new Elysia().use(api);
app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

app.get('/files/*',  async (req) => {
    if(req.user){
        try{
            const { filePath, stats } = await req.repository.process(req.path, "/files");
    
            const ext = filePath.split('.').pop()?.toLowerCase() ?? "unknown";
            const headers: Record<string, string> = {
                'Content-Length': stats.size.toString(),
                'Content-Disposition': `inline; filename="${filePath.split('/').pop() || 'file'}"`,
            };
    
            if (["pdf", "docx", "xlsx"].includes(ext)) {
                headers['Content-Type'] = 'application/pdf';
            } else if (ext === 'txt') {
                headers['Content-Type'] = 'text/plain';
            } else if (["zip", "rar", "gz"].includes(ext)) {
                headers['Content-Type'] = 'application/zip';
                headers['Accept-Ranges'] = 'bytes';
            }else if(["mp4", "mkv", "avi"].includes(ext)) {
                headers['Content-Type'] = 'video/mp4';
                headers['Accept-Ranges'] = 'bytes';
            }else if (["jpg", "png", "gif", "webp"].includes(ext)) {
                headers['Content-Type'] = `image/${ext}`;
            }else if (["mp3", "wav"].includes(ext)) {
                headers['Content-Type'] = 'audio/mpeg';
                headers['Accept-Ranges'] = 'bytes';
            }else {
                headers['Content-Type'] = 'application/octet-stream';
            }
    
            return new Response(req.repository.serve(filePath), { headers });
        }catch(error){
            console.error(error);
            return new Response('Not found', { status: 404 });
        } 
    }else{
        return new Response('unathourized access', { status: 401 });
    } 
});

app.get('/download/*',  async (req) => {
    if(req.user){
        try{
            const { filePath, stats } = await req.repository.process(req.path, "/download");
    
            return new Response(req.repository.serve(filePath), {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
                    'Content-Length': stats.size.toString(),
                    'Accept-Ranges': 'bytes',
                },
            });
        }catch(error){
            console.error(error);
            return new Response('Not found', { status: 404 });
        }
    }else{
        return new Response('unathourized access', { status: 401 });
    }
});

const pageHeaders: HeadersInit = {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

app.get("/*", async ({ user, redirect, path }) => {
    let html = htmlBuilder({ title: "Connect | App", jsFile: "index.js", cssFiles: ["app.css", "streaming.css" ]});
    if(!user){
        html = htmlBuilder({ title: "Connect | Login", jsFile: "login.js", cssFiles: ["app.css", "login.css"]});
    }

    return new Response(html, { headers: pageHeaders });
});

app.get('/favicon.ico', async () => {
    const filePath = `./public/favicon.ico`;
    
    try {
        const file = Bun.file(filePath)
        if (await file.exists()) {
            return new Response(file)
        }
        return new Response('Not found', { status: 404 })
    } catch (error) {
        return new Response('Invalid request', { status: 400 })
    }
});

app.listen(3000, (details)=>{
    console.log(details);
    console.log(`🦊 Elysia is running at ${details?.hostname}:${details?.port}`);
});