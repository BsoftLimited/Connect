import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'

// Types
interface User {
    id: string
    email: string
    username: string
}

// Mock user validation (replace with your database)
async function validateUser(email: string, password: string): Promise<User | null> {
    // Implement your actual user validation here
    if (email === 'user@example.com' && password === 'password') {
        return { id: '1', email, username: 'testuser' }
    }
    return null
}

// Auth plugin
const authPlugin = new Elysia().use(
    jwt({ name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-super-secret-key',
      exp: '7d'
    })
);
  
authPlugin.use(cookie());
authPlugin.derive(async ({ jwt, cookie: { auth_token } }) => {
    let user: User | null = null
    
    if (auth_token?.value) {
        try {
            const payload = await jwt.verify(auth_token.value);
            if (payload){
                user = { id: payload.id!.toString(), email: payload.email!.toString(), username: payload.username!.toString()  };
            }
      } catch (error) {
        // Token is invalid or expired
      }
    }

    return { user }
});
  
authPlugin.post('/login', async ({ jwt, cookie: { auth_token }, body, set }) => {
    // Validate credentials (replace with your actual user validation)
    const user = await validateUser(body.email, body.password)
      
    if (!user) {
        set.status = 401
        return { error: 'Invalid credentials' }
    }

    // Create JWT token
    const token = await jwt.sign({...user});

    auth_token?.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return { success: true, redirect: body.redirect || '/' }
}, { body: t.Object({ email: t.String(), password: t.String(), redirect: t.Optional(t.String()) }) });
  
authPlugin.post('/logout', ({ cookie: { auth_token } }) => {
    auth_token?.remove();
    return { success: true }
});

export default authPlugin;