import { OpenAPIHono, z } from "@hono/zod-openapi";
import { auth } from "../auth";


const authApp = new OpenAPIHono()


authApp.on(["POST","GET"], "/**" ,(c) => {
  return auth.handler(c.req.raw);
});


export default authApp;