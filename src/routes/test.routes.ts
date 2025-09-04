// src/routes/userRoutes.ts
import logger from '../utils/winston';
import { Bindings, Variables } from '../types';
import { createRoute } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference';


const app = new OpenAPIHono<{
  Bindings: Bindings,
  Variables: Variables
}>();


const testRoute = createRoute({
  method: 'get',
  path: '/test',
  summary: "Test Route",
  responses: {
    200: {
      description: 'Retrieve the user',
    },
  },
});

const healthRoute =  createRoute({
  method: "get",
  path: "/health",
  summary: "/health",
  description: "Check Health of server",
  responses: {
    200: {
      description: "Health OK",
      content: {
        "text/plain" : {
          "schema" : { type : "string" , description: "Check health status of server"}
        }
      }
    },
    400:{
      description: "Bad Request"
    }
  }
})


app.openapi(testRoute, (c) => {
  logger.info('Server Working Properly...');
  return c.text('Hello Hono!')
});

app.openapi(healthRoute, (c) => {
  return c.text("Health OK");
});




export type AppType = typeof app
export default app