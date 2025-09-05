import { betterAuth } from "better-auth";
import { admin, createAuthMiddleware, openAPI, jwt, multiSession } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./utils/prisma";
import { emitUserEvent } from "./utils/events";



export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    openAPI(),
    admin(),
    jwt(),
    multiSession({
      maximumSessions: 3
    }),
  ],

  hooks:{
    after: createAuthMiddleware(async (ctx) => {
        if(ctx.path.includes("/sign-up")){
          console.log("Event emitted to update other services");
          await emitUserEvent("user:created", {userId :ctx.context.newSession?.user.id});
        }
      })
  }
  
});


