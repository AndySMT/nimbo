import { createTRPCRouter, publicProcedure, protectedProcedure } from "./trpc";
import { z } from "zod";

export const appRouter = createTRPCRouter({
  // GET /api/trpc/demo.hello
  "demo.hello": protectedProcedure
    .input(z.object({}).optional()) // input opzionale per semplicità
    .query(({ ctx }) => ({
      ok: true,
      message: `Ciao da tRPC! user=${ctx.user?.id ?? "anon"}`,
    })),

  // POST-like: /api/trpc/demo.echo (mutation)
  "demo.echo": protectedProcedure
    .input(z.object({ text: z.string().min(1) }).optional())
    .mutation(({ input }) => ({
      ok: true,
      received: input ?? null,
    })),
});

export type AppRouter = typeof appRouter;
