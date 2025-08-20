import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';

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

const authPlugin = new Elysia().use( jwt({ name: 'jwt', secret: 'test'}));

const api = new Elysia({ prefix: "/api" }).use(authPlugin);
api.get('/login', async ({ jwt, body: { email, password }, cookie: { auth } }) => {
     const user = await validateUser(body.email, body.password)
    	const value = await jwt.sign({ name })

        auth?.set({
            value,
            httpOnly: true,
            maxAge: 7 * 86400,
        })

        return `Sign in as ${value}`
}, { body: t.Object({ email: t.String(), password: t.String() }) });

const app = new Elysia().use(authPlugin);



app.get('/profile', async ({ jwt, status, cookie: { auth } }) => {
        const profile = await jwt.verify(auth?.value)

        if (!profile)
            return status(401, 'Unauthorized')

        return `Hello ${profile.name}`
});

app.listen(3000)