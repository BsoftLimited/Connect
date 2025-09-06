import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import type { User } from "./common/user";
import UserRepository from "./repositories/user_repository";

export const authPlugin = new Elysia().use( jwt({ name: 'jwt', secret: 'test'})).decorate({ "userRepository": new UserRepository() }).derive({ as: "global" }, async ({ request, jwt, userRepository, cookie: { auth } })=>{
    let user: User | undefined = undefined;

    //console.log(`checking for auth cookie for: ${request.url}`);
    try {
        const payload: any = await jwt.verify(auth?.value);
        if (payload){
            try {
                const userId = payload.userId;
                user = await userRepository.get(userId);
                //console.log("auth cookie found, user:", user);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        }
    } catch (error) {
        console.log(error);
    }
    return { user };
});

const auth = new Elysia({ prefix: "/auth"}).use(authPlugin);

auth.post('/login', async ({ jwt, userRepository, status, body: { email, password }, cookie: { auth } }) => {
    try {
        const user = await userRepository.login(email, password);
        const value = await jwt.sign({ userId: user.id });

        auth?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return `Sign in as ${value}`;
    } catch (error) {
        console.error("Login error:", error);
        return status(404, "Invalid email or password");
    }
}, { body: t.Object({ email: t.String(), password: t.String() }) });

auth.post('/logout', ({ cookie: { auth } }) => {
    auth?.set({ value: '', maxAge: 0, httpOnly: true });
    return { success: true }
});

export default auth;