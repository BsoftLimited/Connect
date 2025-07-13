import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { homedir } from "os";
import { join } from "path";
import { html, Html } from "@elysiajs/html";
import Directory from "./components/directory";

const app = new Elysia();
app.use(html())


// serve the folder called "public" at the root URL
const home = homedir();
const downloadPath = join(home, 'Downloads');

const assetsRouter = new Elysia({ prefix: '/assets' }).get('/:file',  async (req) => {
    console.log(`Request path: ${req.path}`);
    if (req.params.file.includes('%20')) {
        req.params.file = decodeURIComponent(req.params.file)
    }

    const filePath = join(downloadPath, req.params.file);
    const file = Bun.file(filePath);
    console.log(`Serving file: ${filePath}`);

    // Check if the file exists before serving it
    if (await file.exists()) {
            return new Response(file)
    }
        
    return new Response('Not found', { status: 404 })
});

app.use(assetsRouter);
app.use(staticPlugin({ assets: "public", prefix: "/" }));

app.get("/", async(req) => {
    const result = await Bun.$`ls ${downloadPath}`.text()
    const files = result.split('\n').filter(file => file); // Filter out empty strings

    return (
        <Directory name="Downloads" files={files} />
    );
});


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
