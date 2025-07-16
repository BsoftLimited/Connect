import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html, Html } from "@elysiajs/html";
import Directory from "./components/directory";
import FilesRepository from "./utils/files_repository";

const fileRepository = new FilesRepository();

const app = new Elysia();
app.use(html());

// serve the folder called "public" at the root URL
app.get('/files/*',  async (req) => {
    console.log(`Request path: ${req.path}`);
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path)
    }

    const filePath = req.path.replace("/files", "");

    // Check if the file exists before serving it
    if (await fileRepository.fileExists(filePath)) {
        return new Response(fileRepository.seve(filePath));
    }
    return new Response('Not found', { status: 404 })
});

app.get('/download/*',  async (req) => {
    console.log(`Request path: ${req.path}`);
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path)
    }

    const filePath = req.path.replace("/download", "");

    // Check if the file exists before serving it
    if (await fileRepository.fileExists(filePath)) {
        return new Response(fileRepository.seve(filePath), {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
            },
        });
    }
    return new Response('Not found', { status: 404 })
});


app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

app.get("/*", async(req) => {
    const directory = await fileRepository.get(req.path)

    return (
        <Directory details={directory} />
    );
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
