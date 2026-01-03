import { createRoute, OpenAPIHono, z, RouteConfigToTypedResponse } from "@hono/zod-openapi";
import { UserModelSchema } from "../../generated/zod/schemas";
import { signIn } from "../controllers/auth.controller";

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



export type mainRouteReturn = RouteConfigToTypedResponse<typeof mainRoute>

adminApp.openapi(mainRoute, async (c) => {
  return await signIn(c);
});


export default adminApp;