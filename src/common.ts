export type Role = "admin" | "user" | "guest";
export type AccessLevel = "read-only" | "read-write";
export type ThemePreference = "light" | "dark" | "system";

export interface Credentials {
    id: string;
    email: string;
    password: string;
}

export type NotifcationType = "info" | "important" | "error";

export interface FileReport{
    ntype: NotifcationType,
    message: string
}

export interface Notification extends FileReport{
    id: string,
    seen: boolean
}

export interface User {
    id: string
    email: string
    username: string
    role: Role
    accessLevel: AccessLevel
    initialized: boolean

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

export interface CreateUserData{
    email: string
    username: string
    role: "guest" | "user"
    accessLevel: AccessLevel
}

export interface SignUpData extends CreateUserData{
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

export interface SiteConfigUpdate{
    id: string

    maintenanceMode: boolean
    allowGuestSignup: boolean
    allowGuestDownload: boolean
}

export interface State<T>{
    loading: boolean;
    data?: T;
    error?: any;
}

export interface SignInStatus{
    message: string;
    status: "warning" | "error";
}

export interface ChangePasswordForm{
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
}

export interface UpdateProfileData{
    username?: string, email?: string
}

export interface UpdateProfileFailed{
    message?: string, error?: UpdateProfileData
}

export interface EditUserFormData{
    id: string,
    role: Role
    accessLevel: AccessLevel
}

export interface EditUserFailed{
    message?: string,
    error?: { accessLevel?: string }
}