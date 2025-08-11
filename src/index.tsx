import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import FilesRepository from "./utils/files_repository";


const fileRepository = new FilesRepository();

const app = new Elysia();
app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

app.get('/files/*',  async (req) => {
    try{
        const { filePath, stats } = await fileRepository.process(req.path, "/files");

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

        return new Response(fileRepository.seve(filePath), { headers });
    }catch(error){
        console.error(error);
        return new Response('Not found', { status: 404 });
    }    
});

app.get('/download/*',  async (req) => {
    try{
        const { filePath, stats } = await fileRepository.process(req.path, "/download");

        return new Response(fileRepository.seve(filePath), {
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
});

app.get("/api/*", async(req) => {
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

app.post('/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | undefined;
    const dest = formData.get("dest")?.toString();

    if (!file) {
        return new Response('No file uploaded', { status: 400 });
    }

    if(!dest){
        return new Response("destination folder not specified", { status: 400 });
    }

    // Save file
    try{
        fileRepository.save(dest, file);

        return new Response(JSON.stringify({ message: 'File uploaded successfully', filename: file.name, size: file.size }),{
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
});

app.get("/*", async () => {
    //const render = renderToString(()=> <App />);
    const html = `<html lang="en">
        <head>
            <title>Connect | App</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="/assets/css/app.css" />
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
            <main id="root"></main>
            <script src="/assets/js/app.js"></script>
        </body>
    </html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    });
});

app.listen(3000, (details)=>{
    console.log(details);
    console.log(`🦊 Elysia is running at ${details?.hostname}:${details?.port}`);
});