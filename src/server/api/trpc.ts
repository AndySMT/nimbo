import { initTRPC } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";

export type Context = {
  token: string;
  req: NextApiRequest;
  res: NextApiResponse;
};

export const createTRPCContext = (opts: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Context => {
  const auth = opts.req.headers["authorization"] || "";
  const token =
    typeof auth === "string" && auth.startsWith("Bearer ")
      ? auth.slice("Bearer ".length)
      : "";

  return { token, req: opts.req, res: opts.res };
};

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.token) {
    throw new Error("UNAUTHORIZED");
  }
  return next();
});
