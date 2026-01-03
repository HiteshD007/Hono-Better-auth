import { betterAuth } from "better-auth";
import { admin, createAuthMiddleware, openAPI, jwt, multiSession } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./utils/prisma";
// import { emitUserEvent } from "./utils/events";



export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb"
  }),
  advanced:{
    defaultCookieAttributes:{
      domain:"hono-next.onrender.com",
      path: "/",
      sameSite:"lax",
      secure: true,
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:{
    google:{
      clientId: process.env.HITESH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.HITESH_GOOGLE_SECRET!,
    }
  },
  plugins: [
    openAPI(),
    admin({
      adminUserIds: ["vKWCRdVmL5i9gAMZX5kgJtsSJRjt0i3Q"],
      adminRoles: ["admin","super-admin","moderator"],
      defaultRole: "user",
    }),
    jwt(),
    multiSession({
      maximumSessions: 3
    }),
  ],
  user:{
    additionalFields:{

    }
  },
  session:{

  },
  databaseHooks:{
    user:{
      create: {
        async after(user, context) {
          console.log("Event emitted to update other services");
          // await emitUserEvent("user:created", {userId : user.id});
        },
      },
      
    },
  },
  hooks:{
    // after: createAuthMiddleware(async (ctx) => {
    //     if(ctx.path.includes("/sign-up")){
    //       console.log("Event emitted to update other services");
    //       await emitUserEvent("user:created", {userId :ctx.context.newSession?.user.id});
    //     }
    //   })
  },
  trustedOrigins: ["http://localhost:3000","https://hono-next.onrender.com",'https://hono-better-auth.onrender.com']
  
});