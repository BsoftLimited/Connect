import { Elysia, status, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import FilesRepository from './utils/files_repository';

const fileRepository = new FilesRepository();

interface User {
    id: string
    email: string
    username: string
    role: "admin" | "user"
}

async function validateUser(email: string, password: string): Promise<User | null> {
    if (email === 'admin@gmail.com' && password === 'admin') {
        return { id: '1', email, username: 'admin', role: "admin" }
    }

    if (email === 'okelekelenobel@gmail.com' && password === 'Ruthless247@') {
        return { id: '1', email, username: 'nobel44', role: "user" }
    }
    return null
}

const authPlugin = new Elysia({ prefix: "/auth"}).use( jwt({ name: 'jwt', secret: 'test'})).derive({ as: "global" }, async ({ jwt, cookie: { auth } })=>{
    let user: User | undefined = undefined;

    console.log("checking for auth cookie");
    try {
        const payload: any = await jwt.verify(auth?.value);
        if (payload){
            user = payload as User;
        }
    } catch (error) {
        console.log(error);
    }

    return { user };
});

const auth = new Elysia({ prefix: "/auth"}).use(authPlugin);

auth.post('/login', async ({ jwt, status, body: { email, password }, cookie: { auth } }) => {
    const user = await validateUser(email, password);
    if(user){
        const value = await jwt.sign({ ...user });

        auth?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return `Sign in as ${value}`;
    }else{
        return status(404, 'user not found');
    }
}, { body: t.Object({ email: t.String(), password: t.String() }) });

auth.post('/logout', ({ cookie: { auth_token } }) => {
    auth_token?.remove();
    return { success: true }
});

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