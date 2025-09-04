import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances in dev
  // (important for Next.js hot-reloading)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // add "query" if debugging
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}






// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const db = globalForPrisma.prisma ?? new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;