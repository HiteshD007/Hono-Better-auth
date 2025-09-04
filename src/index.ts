import { Hono } from 'hono';
import chalk from 'chalk';
import {RegExpRouter}  from 'hono/router/reg-exp-router'
import { Bindings, Variables } from './types';

const app = new Hono<{
  Bindings: Bindings,
  Variables: Variables
}>({
  router: new RegExpRouter(),
});


const logger = {
    info: (msg:string,...args:any[]) => console.log(chalk.blue(`[${new Date().toISOString()}] INFO: ${msg}`), ...args),
    warn: (msg:string) => console.log(chalk.yellow(`[${new Date().toISOString()}] WARN: ${msg}`)),
    error: (msg:string) => console.log(chalk.red(`[${new Date().toISOString()}] ERROR: ${msg}`)),
    success: (msg:string) => console.log(chalk.green(`[${new Date().toISOString()}] SUCCESS: ${msg}`))
};

// In your Hono app
app.use('*', async (c, next) => {
    logger.info(`${c.req.method} ${c.req.path}`);
    await next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.get('/hello', async (c) => {
  return c.json({message:true},200);
})


app.post('/test-post', async (c) => {
  const body = await c.req.json();
  return c.json({message:true},200);
})

app.notFound((c) => {
  return c.text("Route Not Found", 404);
})

export default {
  port: 8000,
  fetch: app.fetch
}


export { app }