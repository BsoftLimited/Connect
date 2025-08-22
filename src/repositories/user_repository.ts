import type { User, Credentials } from "../common/user";

const sampleUsers: User[] = [
    { id: '1', email: 'admin@gmail.com', username: 'admin', role: "admin", accessLevel: "read-write" },
    { id: '2', email: 'okelekelenobel@gmail.com', username: 'nobel44', role: "user", accessLevel: "read-only" }
];

const sampleCredentials: Credentials[] = [
    { id: '1', email: 'admin@gmail.com', password: 'admin' },
    { id: '2', email: 'okelekelenobel@gmail.com', password: 'Ruthless247@' }
]

class UserRepository{
    get = async(id: string): Promise<User> => {
        const user =  sampleUsers.find(user => user.id === id);

        if (user) {
            return user;
        } else {
            throw new Error(`User with id ${id} not found`);
        }
    }

    login = async (email: string, password: string): Promise<User> => {
        const credential = sampleCredentials.find(cred => cred.email === email && cred.password === password);
        if (credential) {
            const user = sampleUsers.find(user => user.id === credential.id);
            if (user) {
                return user;
            }
        }
        throw new Error('Invalid email or password');
    }
}

export default UserRepository;