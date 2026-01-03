import { Context } from "hono";
import { AppContext } from "../types";
import { prisma } from "../utils/prisma";
import { mainRouteReturn } from "../routes/admin.route"


export const signIn = async(c:Context): Promise<mainRouteReturn> => {
  try {
    return c.json({email:"hello",id:"123",name:"hitesh"},200);

  } catch (error) {
    console.log(error);
    return c.text("something went wrong.",400)
  }
}
