import { PrismaClient } from "./generated/prisma/client";
import path from 'path';
import { suffix } from "bun:ffi";

const connect = (): PrismaClient => {
    const client = new PrismaClient({ log: [{ level: 'query', emit: 'event' }], });
    client.$connect().catch((error)=>{
        if(error){
            console.error("Error connecting to database", error);
        }
    });
    return client;
}

export class Err extends Error{
    code : number;
    error: any; 

    constructor(code : number, error: any, message: string){
        super(message);

        this.code = code;
        this.error = error;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class DBManager{
    private static __db?: PrismaClient;

    private constructor() {}

    static instance(): PrismaClient{
        if(!DBManager.__db){
            try{
                DBManager.__db = connect();
                return DBManager.__db!;
            }catch(error){
                throw error;
            }
        }else{
            return DBManager.__db!;
        }
    }

    static disponse = () =>{
        DBManager.__db?.$disconnect();
    }
}

export async function seed() {
    let email = "admin@connect.com";
    let username = "admin";

    try{
        console.info("initializing seeding: connecting to database");
        const database = DBManager.instance();

        if(process.env.ADMIN_PASSWORD){
            console.info("initializing seeding: checking database for credentials");
            const credentials = await database.credentials.upsert({ where: { email }, 
                create: {
                    email, password: process.env.ADMIN_PASSWORD
                }, update: {
                    email, password: process.env.ADMIN_PASSWORD
                }
            });
        
            console.info("initializing seeding: checking database for admin details");
            const user = await database.user.upsert({
                where: { id: credentials.id },
                create: { id: credentials.id, email, username, role: "admin", accessLevel: "read-write" },
                update: { email, username: process.env.ADMIN_USERNAME }
            });

            console.log(`seeding finished success. with email: ${credentials.email} and password: ${credentials.password}`);
        }else{
            throw Error("no admin password provided");
        }
    }catch(error){
        throw error;
    }
}

export { DBManager };