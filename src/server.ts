import { Bindings, Variables } from './types';
import logger from './utils/winston';
import { auth } from './auth';
import { cors } from "hono/cors"
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { OpenAPIHono } from '@hono/zod-openapi';
import authApp from './routes/auth.route';
import adminApp from './routes/admin.route';

const app = new OpenAPIHono<{
  Bindings: Bindings,
  Variables: Variables
}>().basePath("/api");

app.use(
	"*", // "/api/auth/*" for specific route
	cors({
		origin: "http://localhost:3000", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);


app.use("*" , async (c, next) => {
  logger.http("HTTP REQUEST -> ",{
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


app.route('/auth', authApp);
app.route('/admin', adminApp);


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
  servers: [{url : "http://localhost:8000/api", description: "Local Host Server"}],
}
);

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




app.notFound((c) => {
  return c.text("Route Not Found", 404);
});


serve({
  port: 8000,
  fetch: app.fetch
}, (info) => logger.info(`Server started on Port ${info.port}`));


// export default {
//   port: 8000,
//   fetch: app.fetch
// }


export { app };


// SCALER THEMES
//  'alternate',
//   'default',
//   'moon',
//   'purple',
//   'solarized',
//   'bluePlanet',
//   'deepSpace',
//   'saturn',
//   'kepler',
//   'elysiajs',
//   'fastify',
//   'mars',
//   'laserwave',
//   'none',