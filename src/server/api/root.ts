import { createTRPCRouter, publicProcedure, protectedProcedure } from "./trpc";
import { z } from "zod";
import { questsRouter } from "./routers/quests"; // ⬅️ nuovo import

export const appRouter = createTRPCRouter({
  // demo di prima
  "demo.hello": protectedProcedure
    .input(z.object({}).optional())
    .query(({ ctx }) => ({
      ok: true,
      message: `Ciao da tRPC! user=${ctx.user?.id ?? "anon"}`,
    })),

  "demo.echo": protectedProcedure
    .input(z.object({ text: z.string().min(1) }).optional())
    .mutation(({ input }) => ({
      ok: true,
      received: input ?? null,
    })),

  // ⬇️ monta il router quests
  quests: questsRouter,
});

export type AppRouter = typeof appRouter;
