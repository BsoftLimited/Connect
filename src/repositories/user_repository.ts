import type { User, Credentials, CreateUser } from "../common/user";
import { DBManager } from "../config";

class UserRepository{
    database = DBManager.instance();
    
    get = async(id: string): Promise<User> => {
        const user =  await this.database.user.findUnique({ where: { id } });

        if (user) {
            return user;
        } else {
            throw new Error(`User with id ${id} not found`);
        }
    }

    login = async (email: string, password: string): Promise<User> => {
        const credentials = await this.database.credentials.findUnique({ where: { email, password } });
        if (credentials) {
            const user =  await this.database.user.findUnique({ where: { id: credentials.id } });
            if (user) {
                return user;
            }
        }
        throw new Error('Invalid email or password');
    }

    create = async (input: CreateUser): Promise<User> =>{
        const credentials = await this.database.credentials.create({ data: { email: input.email, password: input.password } });
        if(credentials){
            const user =  await this.database.user.create({ data: { id: credentials.id, email: input.email, username: input.username, accessLevel: input.accessLevel } });
            if (user) {
                return user;
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
        return await this.database.user.update({ 
            where: { id: input.id },
            data: { ...input }
        });
    }

    delete = async (id: string): Promise<User> =>{
        const init = await this.database.credentials.delete({ 
            where: { id }, include: { user: true }
        });   

        return init.user!;
    }

    changePassword = async (input: { id: string, newPassword: string, oldPassword: string }): Promise<User> =>{
        const credentials = await this.database.credentials.findUnique({ where: { id: input.id } });

        if(credentials?.password === input.oldPassword){
            const init = await this.database.credentials.update({ 
                where: { id: input.id }, data: { password: input.newPassword }, include: { user: true }
            });
            return init.user!;
        }
        throw new Error("password mismatch");
    }
}

export default UserRepository;