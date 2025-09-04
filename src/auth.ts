import { betterAuth } from "better-auth";
import { admin, openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./utils/prisma";

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
  ],
  
});


