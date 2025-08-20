import { Elysia, status, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import FilesRepository from './utils/files_repository';

const fileRepository = new FilesRepository();



const api = new Elysia({ prefix: "/api" }).decorate("repository", fileRepository).use(authPlugin);
api.onBeforeHandle(async ({ user }) => {
    if (!user) {
        return status(404, 'unauthorized to use the API');
    }
});

api.get("/", ({ status })=>{
    return status(200, 'welcome to the API');
});

const app = new Elysia().use(api).use(auth);

app.get('/', async ({ user, redirect }) => {
    if (!user) {
        return redirect(`/login`);
    }
    console.log("I am in");
    return `Hello ${user?.email ?? "unknowned" }`;
});

app.get('/login', async () => {
    return `please login`;
});

app.listen(3000, (server)=>{
    console.log(server);
});