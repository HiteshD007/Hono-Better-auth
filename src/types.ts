import { auth } from "./auth"
import { Context } from "hono"

export type AppContext = Context<{Variables:Variables, Bindings: Bindings}>;

export type Bindings = {}

export type Variables = {
  user: typeof auth.$Infer.Session.user | null,
  session: typeof auth.$Infer.Session.session | null
}