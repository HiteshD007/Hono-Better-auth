import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserModelSchema } from "../../generated/zod/schemas";
const adminApp = new OpenAPIHono();


const UserSchema = UserModelSchema.openapi("user");
const PublicUserSchema = UserModelSchema.pick({id:true,name:true,email:true}).openapi("publicUser");

const mainRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Base admin Route",
  tags: ['Admin'],
  responses:{
    200: {
      description: "Check Admin Route",
      content: {
        "application/json": {
          schema: PublicUserSchema
        }
      }
    },
    400: {
      description: "Something Went wrong",
      content: {
        "text/plain": {
          schema: z.string().openapi({example: "Something went wrong"})
        }
      }
    }
  }
});





adminApp.openapi(mainRoute, (c) => {
  return c.json({
    id: "h1", 
    name: "hitesh", 
    email: "hitesh@example.com", 
  }, 200)
  return c.text("something went wrong", 400);
});


export default adminApp;