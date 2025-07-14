import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html, Html } from "@elysiajs/html";
import Directory from "./components/directory";
import FilesRepository from "./utils/files_repository";

const fileRepository = new FilesRepository();

const app = new Elysia();
app.use(html());


// serve the folder called "public" at the root URL

const assetsRouter = new Elysia({ prefix: '/files' }).get('*',  async (req) => {
    console.log(`Request path: ${req.path}`);
    if (req.path.includes('%20')) {
        req.path = decodeURIComponent(req.path)
    }

    const filePath = req.path.replace("/files", "");
    const file = Bun.file(filePath);
    
    console.log(`Serving file: ${filePath}`);

    // Check if the file exists before serving it
    if (await file.exists()) {
            return new Response(file)
    }
        
    return new Response('Not found', { status: 404 })
});

app.use(assetsRouter);
app.use(staticPlugin({ assets: "public", prefix: "/assets" }));

const pageRouter = new Elysia({ prefix: '/' }).get("/", async(req) => {
    const directory = await fileRepository.get(req.path)

    return (
        <Directory details={directory} />
    );
});
app.use(pageRouter);


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
