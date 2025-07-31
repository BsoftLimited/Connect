import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html, Html } from "@elysiajs/html";
import FilesRepository from "./utils/files_repository";
import { Writable } from 'stream';
import { stat } from 'fs/promises';

import ffmpeg from 'fluent-ffmpeg';

import Home from "./pages/home";
import { log } from "console";
import Streaming from "./pages/streaming";

const fileRepository = new FilesRepository();

const app = new Elysia();
app.use(html());

// serve the folder called "public" at the root URL
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

app.get('/stream/*', function* (req){
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const filePath = req.path.replace("/stream", "");
    const inputPath = fileRepository.filePath(filePath);

    // Validate file type (basic check for video extension)
    const validExtensions = ['.mp4', '.mkv', '.avi', '.mov'];
    const extention = req.path.toLowerCase().substring(req.path.length - 4);
    if (!validExtensions.includes(extention)) {
        return new Response('Invalid file type', { status: 400 });
    }
    
    try{
        // Create transform stream
        const transformer = new TransformStream()
        const writer = transformer.writable.getWriter();

        // Create a Node.js Writable stream to bridge with FFmpeg
        const nodeWritable = new Writable({
            write(chunk, encoding, callback) {
                // Write chunk to TransformStream writer
                writer.write(chunk).then(() => callback()).catch(callback);
                log(`Writing chunk of size: ${chunk.length}`);
            },
            final(callback) {
                // Close the TransformStream writer when done
                writer.close().then(() => callback()).catch(callback);
            },
            destroy(err, callback) {
                // Handle errors and abort the writer
                writer.abort(err).then(() => callback(err)).catch(callback);
            }
        });

        // Handle client disconnection
        req.request.signal.addEventListener('abort', () => {
            writer.close();
            nodeWritable.destroy();
            ffmpegProcess.kill('SIGTERM'); // Terminate FFmpeg
        });
        
        const ffmpegProcess = ffmpeg(inputPath)
            .format('mp4').videoCodec('libx264').audioCodec('aac')
            .outputOptions([
                '-movflags frag_keyframe+empty_moov', // For streaming
                '-f mp4'
            ]).on('error', (err) => {
                console.error('FFmpeg error:', err)
                nodeWritable.destroy(err);
                req.set.status = 500;
            }).on('end', () => nodeWritable.end());
            
        ffmpegProcess.pipe(nodeWritable, { end: true });

        req.set.headers = {
            'Content-Type': 'video/mp4',
            'Transfer-Encoding': 'chunked'
        };
        return new Response(transformer.readable);
    } catch (err) {
        console.error('Server error:', err);
        req.set.status = 500;
        return new Response('Internal server error', { status: 500 });
    }
});


app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

app.get("/*", async(req) => {
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const directory = await fileRepository.get(req.path);

    return (
        <Home details={directory} />
    );
});

app.get("/streaming/*", async(req) => {
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path);
    }
    const filePath = req.path.replace("/streaming", "");
    const fileName = filePath.split('/').pop()!;
    const directoryPath = filePath.substring(0, filePath.lastIndexOf("/"));

    const directory = await fileRepository.get(directoryPath);

    return (
        <Streaming path={filePath} fileName={fileName} directory={directory}/>
    );
});

app.get('/favicon.ico', async (context) => {
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