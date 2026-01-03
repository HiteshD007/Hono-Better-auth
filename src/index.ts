// import { Hono } from 'hono';
// import chalk from 'chalk';
// import {RegExpRouter}  from 'hono/router/reg-exp-router'
// import { Bindings, Variables } from './types';

// const app = new Hono<{
//   Bindings: Bindings,
//   Variables: Variables
// }>({
//   router: new RegExpRouter(),
// });


// const logger = {
//     info: (msg:string,...args:any[]) => console.log(chalk.blue(`[${new Date().toISOString()}] INFO: ${msg}`), ...args),
//     warn: (msg:string) => console.log(chalk.yellow(`[${new Date().toISOString()}] WARN: ${msg}`)),
//     error: (msg:string) => console.log(chalk.red(`[${new Date().toISOString()}] ERROR: ${msg}`)),
//     success: (msg:string) => console.log(chalk.green(`[${new Date().toISOString()}] SUCCESS: ${msg}`))
// };

// // In your Hono app
// app.use('*', async (c, next) => {
//     logger.info(`${c.req.method} ${c.req.path}`);
//     await next();
// });

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// });

// app.get('/hello', async (c) => {
//   return c.json({message:true},200);
// })


// app.post('/test-post', async (c) => {
//   const body = await c.req.json();
//   return c.json({message:true},200);
// })

// app.notFound((c) => {
//   return c.text("Route Not Found", 404);
// })

// export default {
//   port: 8000,
//   fetch: app.fetch
// }


// export { app }


import { Bindings, Variables } from './types';
// import logger from './utils/winston';
import { auth } from './auth';
import { cors } from "hono/cors"
import { serve } from '@hono/node-server';

import { graphqlServer } from '@hono/graphql-server'
import { createYoga } from 'graphql-yoga'

import { Hono } from 'hono';
import { verifyViaJwks } from './utils/jwks';
import { Scalar } from '@scalar/hono-api-reference';
import { OpenAPIHono } from '@hono/zod-openapi';
import authApp from './routes/auth.route';
import adminApp from './routes/admin.route';
import sessionsApp from './routes/sessions.route';
import { QLSchema } from './utils/schema-builder';
import { rootResolver, simpleSchema } from './graphql';

const app = new OpenAPIHono<{
  Bindings: Bindings,
  Variables: Variables
}>().basePath("/api");

app.use(
  "*", // "/api/auth/*" for specific route
  cors({
    origin: "http://localhost:3000", // replace with your origin
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS","PATCH","DELETE"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);


app.use("*" , async (c, next) => {
  console.log("HTTP REQUEST -> ",{
    Method: c.req.method, 
    Path: c.req.path
  });

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  
  if(!session){
    c.set('user', null);
    c.set('session', null);
    return next()
  }

  c.set('user',session.user);
  c.set('session',session.session);

  return next();
});


// Parse Bearer JWT if no session is present
app.use("*", async (c, next) => {
  if (c.get('session')) return next();
  const authz = c.req.header('authorization');
  if (!authz || !authz.startsWith('Bearer ')) return next();
  try {
    const token = authz.slice(7);
    const claims = await verifyViaJwks(token);
    c.set('jwtClaims', claims as any);
  } catch {
    // ignore invalid/expired token
  }
  return next();
});

app.get('/' , async (c) => {
  return c.text('correctly working.')
})

app.route('/auth', authApp);
app.route('/admin', adminApp);
app.route('/sessions', sessionsApp);


app.doc("/docs", {
  externalDocs:{
    description: "Auth Docs",
    url: "/api/auth/reference"
  },
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "API References",
    description: "API Documentation of your service",
    contact: {
      name: "hitesh dahiya",
      email: "hiteshdahiya81@gmail.com"
    },
    license: {
      name: "license-123",
      url: "not available"
    },
    termsOfService:"should not be used for hacking means"
  },
  servers: [{url : "http://localhost:8000", description: "Local Host Server"}],
});

app.get(
  '/reference',
  // async (c, next) => {
  //   const user = c.get('user');
    
  //   console.log(user)

  //   if(user?.role === "admin"){
  //     await next()
  //   }

  //   return c.json({
  //     error: {
  //       message: "Unauthorized Access",
  //       code: "UNAUTHORIZED_ACCESS",
  //       error: null
  //     },
  //     data: null,
  //   }, 409);

  // },
  Scalar({
    url: '/api/docs',
    theme: 'bluePlanet',
  })
);

// app.use('/graphql/simple', graphqlServer({
//   schema:simpleSchema,
//   rootResolver: rootResolver,
//   graphiql: true
// }));

// GraphQL endpoint using pothos schema
// app.use('/graphql', graphqlServer({
//   schema: QLSchema,
//   graphiql: true // process.env.NODE_ENV === 'development', // Enable GraphiQL in development
// }));


// const yoga = createYoga({
//   schema: QLSchema, // your Pothos schema
//   graphiql: true,
//   graphqlEndpoint: '/api/graphql/yoga'
// });



// app.use('/graphql/yoga', async (c) => {
//   return yoga(c.req.raw, c.env)
// });


// app.post('/lambda-invoke',async (c) => {
//   const body = await c.req.json();
//   console.log(body);
//   return c.json({success:true, message:"successfully triggered from lambda"})
// });

app.notFound((c) => {
  return c.text("Route Not Found", 404);
});


// serve({
//   port: 8000,
//   fetch: app.fetch
// }, (info) => {
//   console.log(`Server started on Port ${info.port}`)
//   console.log(`GRAPHQL GraphQL endpoint: http://localhost:${info.port}/api/graphql`)
// });

export default {
  port: 8000,
  fetch: app.fetch
}


export { app };