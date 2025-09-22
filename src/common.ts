export type Role = "admin" | "user" | "guest";
export type AccessLevel = "read-only" | "read-write";
export type ThemePreference = "light" | "dark" | "system";

export interface Credentials {
    id: string;
    email: string;
    password: string;
}

export interface User {
    id: string
    email: string
    username: string
    role: Role
    accessLevel: AccessLevel
    createdAt: Date
    updatedAt: Date
}

export interface UserConfig {
    id: string
    
    theme: ThemePreference;
    language: string
    notifications: boolean
    imagePreview:   boolean
}

export interface Session {
    id: string

    user: User
    config: UserConfig
}

export interface CreateUser{
    email: string
    username: string
    role: "guest" | "user"
    accessLevel: AccessLevel
    password: string;
}

export interface SiteConfig{
    id: string
    adminID: string

    siteName:  string
    siteLogo: string
    siteFavicon: string
    siteUrl: string
    siteDescription: string

    createdAt: Date
    updatedAt: Date

    maintenanceMode: boolean
    maintenanceMessage: string
    allowGuestSignup: boolean
    allowGuestDownload: boolean
}

export interface State<T>{
    loading: boolean;
    data?: T;
    error?: any;
}