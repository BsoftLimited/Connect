export interface Credentials {
    id: string;
    email: string;
    password: string;
}

export interface User {
    id: string
    email: string
    username: string
    role: "admin" | "user"
    accessLevel: "read-only" | "read-write"
}