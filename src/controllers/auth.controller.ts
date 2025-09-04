import { AppContext } from "../types";
import { prisma } from "../utils/prisma";

export const signIn = async(c:AppContext) => {
  try {
    await prisma.user.findFirst({
      where: {
        test: true
      }
    });

  } catch (error) {
    console.log(error);
  }
}
