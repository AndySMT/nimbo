import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

type Quest = {
  id: string;
  prompt: string;
  answer: number;
  completed: boolean;
  reward: number;
};

// archivio in-memory per utente (chiave = token)
const store = new Map<string, { points: number; quests: Quest[] }>();

function seedFor(token: string) {
  if (!store.has(token)) {
    store.set(token, {
      points: 0,
      quests: [
        {
          id: "q1",
          prompt: "2 + 3 = ?",
          answer: 5,
          completed: false,
          reward: 10,
        },
        {
          id: "q2",
          prompt: "7 - 4 = ?",
          answer: 3,
          completed: false,
          reward: 10,
        },
        {
          id: "q3",
          prompt: "3 * 4 = ?",
          answer: 12,
          completed: false,
          reward: 15,
        },
        {
          id: "q4",
          prompt: "12 ÷ 3 = ?",
          answer: 4,
          completed: false,
          reward: 15,
        },
        {
          id: "q5",
          prompt: "5² = ?",
          answer: 25,
          completed: false,
          reward: 20,
        },
      ],
    });
  }
  return store.get(token)!;
}

export const questsRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    const { token } = ctx;
    const data = seedFor(token);
    console.log("list():", { points: data.points, quests: data.quests.length });
    return data;
  }),

  submit: protectedProcedure
    .input(z.object({ id: z.string(), answer: z.number() }))
    .mutation(({ ctx, input }) => {
      const { token } = ctx;
      const data = seedFor(token);

      const q = data.quests.find((x) => x.id === input.id);
      if (!q) return { ok: false, reason: "NOT_FOUND" as const };

      if (q.completed) return { ok: true, alreadyCompleted: true as const };

      const correct = input.answer === q.answer;
      if (correct) {
        q.completed = true;
        data.points += q.reward;
      }
      return {
        ok: true,
        correct,
        reward: correct ? q.reward : 0,
        points: data.points,
      };
    }),

  reset: protectedProcedure.mutation(({ ctx }) => {
    const { token } = ctx;
    const data = seedFor(token);
    data.points = 0;
    data.quests.forEach((q) => (q.completed = false));
    return { ok: true };
  }),
});
