import type { AccessLevel, ChangePasswordForm, EditUserFailed, Role, Session, ThemePreference, UserConfig } from "../common";
import type { User, CreateUserData, SignUpData } from "../common";
import { DBManager } from "../config";
import {admin_email, Dual, Trial} from "../utils/util";

interface UserCreateError{
    email?: string
    username?: string
    password?: string
}

class UserRepository{
    database = DBManager.instance();

    private createSession = async(user: User, sessionID?: string ): Promise<Session> =>{
        if(!sessionID){
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 5); // session valid for 5 days 
            
            const session = await this.database.session.create({ data: { userId: user.id, expiresAt } });
            sessionID = session.id;
        }
        
        const config = await this.database.userConfig.upsert({ 
            where: { userId: user.id },
            update: { },
            create: { userId: user.id }
        });

        return { id: sessionID, 
            user,
            config: { ...config, theme: config.theme as ThemePreference } };
    }

    private findUserById = async(id: string): Promise<User> =>{
        const user =  await this.database.user.findUnique({ where: { id } });
        if (user) {
            return { ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel }
        } else {
            throw new Error(`User with id ${id} not found`);
        }
    }

    admin = async(): Promise<User> =>{
        const init = await this.database.user.findUnique({ where: { email: admin_email } });
        if(init){
            return { ...init, role: "admin", accessLevel: "read-write" };
        }
        throw Error("unable to go get admin details");
    } 
    
    get = async(sessionID: string): Promise<Session> => {
        const session = await this.database.session.findUnique({ where: { id: sessionID } });
        if(!session){
            throw new Error("Invalid session");
        }

        // check if session is expired and delete it
        if(session.expiresAt < new Date()){
            await this.database.session.delete({ where: { id: sessionID } });
            throw new Error("Session expired");
        }

        const id = session.userId;
        const user =  await this.findUserById(id);

        return this.createSession(user, sessionID);
    }

    login = async (email: string, password?: string): Promise<Dual<Session, UserCreateError>> => {
        const user = await this.database.user.findUnique({ where: { email } });
        if(!user){
            return Dual.second({ email: "Email provided doesn't belong to any account" });
        }

        if(user.initialized){
            if(!password){
                return Dual.second({ password: "password is required to login" });
            }
            const credentials = await this.database.credentials.findUnique({ where: { email, password } });
            if (credentials) {
                return Dual.first(await this.createSession({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel }));
            }else{
                return Dual.second({ password: "Wrong password, please try again" });
            }
        }else{
            return Dual.first(await this.createSession({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel }));
        }
    }

    create = async (input: CreateUserData): Promise<Dual<User, UserCreateError>> =>{
        const emailResults = await this.database.credentials.findMany({ where: { email: input.email } });
        const usernameResults = await this.database.user.findMany({ where: { username: input.username } });
        if(emailResults.length > 0 || usernameResults.length > 0){
            return Dual.second({
                email: emailResults.length > 0 ? `Email: ${input.email} already exists` : undefined,
                username: usernameResults.length > 0 ? `Username: ${input.username} already exists` : undefined
            });
        }

        const user =  await this.database.user.create({ data: {
            email: input.email, username: input.username, role: input.role, accessLevel: input.accessLevel
        } });
        if(user){
            return Dual.first({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel });
        }
        throw Error(`User creation fialed. user with email: ${input.email} already exists`);
    }

    register = async (input: { email: string, username: string, password: string }): Promise<Dual<Session, UserCreateError>> =>{
        console.log("Creating user:", input);
        const emailResults = await this.database.credentials.findMany({ where: { email: input.email } });
        const usernameResults = await this.database.user.findMany({ where: { username: input.username } });
        if(emailResults.length > 0 || usernameResults.length > 0){
            return Dual.second({
                email: emailResults.length > 0 ? `Email: ${input.email} already exists` : undefined,
                username: usernameResults.length > 0 ? `Username: ${input.username} already exists` : undefined
            });
        }
        const user =  await this.database.user.create({ data: {
            email: input.email, username: input.username, initialized: true
        } });
        if(user){
            const credentials = await this.database.credentials.create({ data: { id: user.id, email: input.email, password: input.password } });
            if (credentials) {
                return Dual.first(await this.createSession({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel }));
            }else{
                await this.database.user.delete({ where: { id: user.id } });
            }
        }
        throw Error(`User registration fialed. user with email: ${input.email} already exists`);
    }

    update = async (input: { id: string, email?: string, username?: string, accessLevel?: AccessLevel, role?: Role }): Promise<Dual<User, EditUserFailed>> =>{
        if(input.accessLevel === "read-write" && input.role === "guest"){
            return Dual.second({ 
                message: "Invalid user update request",
                error: { accessLevel: "Access level for guest must be Read-Only" }
            });  
        }

        if(input.email){
            await this.database.credentials.update({ 
                where: { id: input.id },
                data: { email: input.email }
            });
        }
        
        const user = await this.database.user.update({
            where: {id: input.id},
            data: {...input}
        });

        return Dual.first({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel });
    }

    updateConfig = async (input: { id: string} & Partial<UserConfig>): Promise<UserConfig> =>{
        const config = await this.database.userConfig.update({
            where: { id: input.id },
            data: { ...input }
        });
        return { ...config, theme: config.theme as ThemePreference || "light" };
    }

    delete = async (id: string): Promise<User> =>{
        const init = await this.database.user.delete({ where: { id } });
        if(!init){
            throw new Error("User not found");
        }
        return { ...init, role: init.role as Role, accessLevel: init.accessLevel as AccessLevel };
    }

    deleteSesssion = async (sessionID: string): Promise<boolean> =>{
        const session = await this.database.session.deleteMany({ where: { id: sessionID } });
        return session.count > 0;
    }

    changePassword = async (input: { id: string, newPassword: string, oldPassword: string }): Promise<Dual<User, Partial<ChangePasswordForm>>> =>{
        const credentials = await this.database.credentials.findUnique({ where: { id: input.id } });

        if(credentials?.password === input.oldPassword){
            const init = await this.database.credentials.update({ 
                where: { id: input.id }, data: { password: input.newPassword }, include: { user: true }
            });
            return Dual.first({ ...init.user, role: init.user.role as Role, accessLevel: init.user.accessLevel as AccessLevel });
        }
        return Dual.second({ oldPassword: "Incorrect password, check and try again" });
    }

    createPassword = async (input: { id: string, password: string }): Promise<Session> =>{
        const user = await this.database.user.findUnique({ where: { id: input.id } });
        if(!user){
            throw new Error(`user with id: ${input.id} not found`);
        }

        if(user.initialized){
            throw new Error("account password alread set");
        }

        const init = await this.database.credentials.create({
            data: { id: input.id,  password: input.password, email: user.email }
        });

        await this.database.user.update({
            where: { id: init.id },
            data: { initialized: true }
        });

        if(!init){
            throw new Error("password creation failed, please try again");
        }
        return await this.createSession({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel });
    }

    users = async (): Promise<User[]> =>{
        const users =  await this.database.user.findMany({ where: { NOT: [ { role: "admin" } ] } });
        if (users) {
            return users.map(user => ({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel }));
        } else {
            throw new Error(`error fetching users`);
        }
    }
}

export default UserRepository;