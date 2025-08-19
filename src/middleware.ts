import { Elysia } from 'elysia'

export const requireAuth = (app: Elysia) =>
  app.derive(async ({ user, request, set }) => {
    if (!user) {
      const url = new URL(request.url)
      const redirectTo = url.pathname + url.search
      
      set.status = 302
      set.redirect = `/login?redirect=${encodeURIComponent(redirectTo)}`
      return { authorized: false }
    }

    return { authorized: true }
  })