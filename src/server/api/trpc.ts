import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export type Context = { user?: { id: string } | null };

// Crea il context (prende il token dal header Authorization)
export async function createTRPCContext(opts: { req: any }) {
  const auth = opts.req?.headers?.authorization as string | undefined;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : "";
  const user = token ? { id: "u1" } : null; // mock
  return { user } satisfies Context;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});
