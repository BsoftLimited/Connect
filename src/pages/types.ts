// Define types for your data
export interface User {
  firstName: string;
  lastName: string;
}

export type Info = string[];

// Define props for the Profile component (assuming it exists)
export interface ProfileProps {
  user: User | undefined;
  info: Info;
}