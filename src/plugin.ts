import { Elysia } from 'elysia'

const plugin = new Elysia()
    .decorate('plugine', 5)
    .get('/plugin', ({ plugine }) => plugin)

const app = new Elysia()
    .use(plugin)
    .get('/', ({ plugine }) => plugin)
    .listen(3000)