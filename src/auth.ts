import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import type { Session } from "./common";
import UserRepository from "./repositories/user_repository";
import ConfigRepository from "./repositories/config_repository";

export const authPlugin = new Elysia().use( jwt({ name: 'jwt', secret: 'test'})).decorate({ "userRepository": new UserRepository() }).derive({ as: "global" }, async ({ request, jwt, userRepository, cookie: { auth } })=>{
    let session: Session | undefined = undefined;

    //console.log(`checking for auth cookie for: ${request.url}`);
    try {
        const payload: any = await jwt.verify(auth?.value);
        if (payload){
            try {
                const sessionID = payload.sessionID;
                session = await userRepository.get(sessionID);
                //console.log("auth cookie found, user:", user);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        }
    } catch (error) {
        console.log(error);
    }
    return { session };
});

export const sitePlugin = new Elysia().decorate("configRepository", new ConfigRepository()).derive({ as: "global" }, async ({ configRepository }) => {
    let config;
    try {
        config = await configRepository.get();
    } catch (error) {
        console.error("Error fetching site configuration:", error);
    }
    return { config };
});

const auth = new Elysia({ prefix: "/auth"}).use(authPlugin);

auth.post('/login', async ({ jwt, userRepository, status, body: { email, password }, cookie: { auth } }) => {
    try {
        const session = await userRepository.login(email, password);
        const value = await jwt.sign({ sessionID: session.id });

        auth?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return status(200, { message: "Login successful", user: session.user, config: session.config });
    } catch (error) {
        console.error("Login error:", error);
        return status(404, "Invalid email or password");
    }
}, { body: t.Object({ email: t.String(), password: t.String() }) });

auth.post('/logout', async ({ cookie: { auth }, status, session, userRepository }) => {
    if(session){
        await userRepository.deleteSesssion(session.id).then(() =>{
            console.log(`Logging out user: ${session?.user.username}`);

            auth?.set({ value: '', maxAge: 0, httpOnly: true });
        });
    }
    return status(200, { message: "Logout successful" });
});

auth.use(sitePlugin).post('/register', async ({ userRepository, config, jwt, cookie: { auth }, status, body: { email, username, password } }) => {
    if(config?.allowGuestSignup){
        try {
            const result = await userRepository.register({ email, username, password });
            if(result.isFirst){
                const session = result.first;
                const value = await jwt.sign({ sessionID: session.id });
                auth?.set({ value, httpOnly: true, maxAge: 7 * 86400 });
                
                return status(201, { message: "Registration successful", user: session.user, config: session.config });
            }else{
                const error = result.second;

                return status(400, { message: "form validation failed", ...error });
            }
        } catch (error) {
            console.error("Registration error:", error);
            return status(400,{ message: `User registration failed: ${error}` });
        }
    }else{
        return status(403, { message: "Guest user registration is disabled" });
    }
}, { body: t.Object({ email: t.String(), username: t.String(), password: t.String() }) });

export default auth;