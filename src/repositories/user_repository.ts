import type { AccessLevel, Role, Session, ThemePreference, UserConfig } from "../common";
import type { User, CreateUser } from "../common";
import { DBManager } from "../config";

interface UserCreateError{
    email?: string
    username?: string
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

    login = async (email: string, password: string): Promise<Session> => {
        const credentials = await this.database.credentials.findUnique({ where: { email, password } });
        if (credentials) {
            const user =  await this.findUserById(credentials.id);
            return this.createSession(user);
        }
        throw new Error('Invalid email or password');
    }

    create = async (input: CreateUser): Promise<User| UserCreateError> =>{
        const emailResults = await this.database.credentials.findMany({ where: { email: input.email } });
        const usernameResults = await this.database.user.findMany({ where: { username: input.username } });
        if(emailResults.length > 0 || usernameResults.length > 0){
            return {  }
        }
        const credentials = await this.database.credentials.create({ data: { email: input.email, password: input.password } });
        if(credentials){
            const user =  await this.database.user.create({ data: { id: credentials.id,
                    email: input.email, username: input.username, role: input.role, accessLevel: input.accessLevel
             } });
            if (user) {
                return { ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel };
            }else{
                await this.database.credentials.delete({ where: { id: credentials.id } });
            }
        }
        throw Error(`User creation fialed. user with email: ${input.email} already exists`);
    }

    register = async (input: { email: string, username: string, password: string }): Promise<Session> =>{
        console.log("Creating user:", input);
        const credentials = await this.database.credentials.create({ data: { email: input.email, password: input.password } });
        if(credentials){
            const user =  await this.database.user.create({ data: { id: credentials.id,
                    email: input.email, username: input.username
             } });
            if (user) {
                return this.createSession({ ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel });
            }else{
                await this.database.credentials.delete({ where: { id: credentials.id } });
            }
        }
        throw Error(`User registration fialed. user with email: ${input.email} already exists`);
    }

    update = async (input: { id: string, email?: string, username?: string, accessLevel?: "read-only" | "read-write" }): Promise<User> =>{
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

        return { ...user, role: user.role as Role, accessLevel: user.accessLevel as AccessLevel };
    }

    updateConfig = async (input: { id: string} & Partial<UserConfig>): Promise<UserConfig> =>{
        const config = await this.database.userConfig.update({
            where: { id: input.id },
            data: { ...input }
        });
        return { ...config, theme: config.theme as ThemePreference || "light" };
    }

    delete = async (id: string): Promise<User> =>{
        const init = await this.database.credentials.delete({ 
            where: { id }, include: { user: true }
        }); 

        if(!init.user){
            throw new Error("User not found");
        }
        return { ...init.user, role: init.user.role as Role, accessLevel: init.user.accessLevel as AccessLevel };
    }

    deleteSesssion = async (sessionID: string): Promise<boolean> =>{
        const session = await this.database.session.deleteMany({ where: { id: sessionID } });
        return session.count > 0;
    }

    changePassword = async (input: { id: string, newPassword: string, oldPassword: string }): Promise<User> =>{
        const credentials = await this.database.credentials.findUnique({ where: { id: input.id } });

        if(credentials?.password === input.oldPassword){
            const init = await this.database.credentials.update({ 
                where: { id: input.id }, data: { password: input.newPassword }, include: { user: true }
            });

            if(!init.user){
                throw new Error("User not found");
            }
            return { ...init.user, role: init.user.role as Role, accessLevel: init.user.accessLevel as AccessLevel };
        }
        throw new Error("password mismatch");
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