export interface Credentials {
    id: string;
    email: string;
    password: string;
}

export interface User {
    id: string
    email: string
    username: string
    role: "admin" | "user" | string
    accessLevel: "read-only" | "read-write" | string
}

export interface CreateUser{
    email: string
    username: string
    accessLevel: "read-only" | "read-write" 
    password: string;
}