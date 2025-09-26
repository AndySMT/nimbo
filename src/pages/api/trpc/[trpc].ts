import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export default createNextApiHandler({
  router: appRouter,
  createContext: ({ req }) => createTRPCContext({ req }),
  onError({ error, path, type }) {
    console.error("tRPC error:", {
      type,
      path,
      code: error.code,
      message: error.message,
    });
  },
});
