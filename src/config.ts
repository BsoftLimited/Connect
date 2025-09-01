import { PrismaClient } from "./generated/prisma/client";
import path from 'path';
import { suffix } from "bun:ffi";
import { join } from "@prisma/client/runtime/library";

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

const queryLibraryPath = async(extention: string): Promise<string> =>{
    const libraryPath = path.join(process.cwd(), "./file-handle/target/release");

    let files = (await Bun.$`ls ${libraryPath}`.text()).split('\n').filter(init => init);

    let libraryName = files.find((value)=> value.endsWith(suffix));

    if(libraryName){
        return `${libraryPath}/${libraryName}`;
    }

    throw Error("file-handle library file not found. try running 'bun run compile-rs' in terminal/CMD");
}

export async function seed() {
    console.info("initializing seeding: connecting to database");
    const database = DBManager.instance();

    if(process.env.ADMIN_EMAIL &&  process.env.ADMIN_PASSWORD){
        console.info("initializing seeding: checking database for credentials");
        const credentials = await database.credentials.upsert({ where: { email: process.env.ADMIN_EMAIL }, 
            create: {
                email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD
            }, update: {
                email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD
            } });

        if(process.env.ADMIN_USERNAME){
            console.info("initializing seeding: checking database for admin details");
            const user = await database.user.upsert({
                where: { id: credentials.id },
                create: { id: credentials.id, email: credentials.email, username: process.env.ADMIN_USERNAME, role: "admin", accessLevel: "read-write" },
                update: { email: credentials.email, username: process.env.ADMIN_USERNAME }
            });

            console.log(`seeding finished success.`);
        }else{
            throw Error("no admin username provided");
        }
    }else{
        throw Error("no admin email or password provided");
    }
}

export { DBManager };