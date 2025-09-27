import { createTRPCNext } from "@trpc/next";
import { httpBatchLink, loggerLink, type HTTPHeaders } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

let ACCESS_TOKEN = "";
export const setAccessToken = (t: string) => {
  ACCESS_TOKEN = t;
};

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            const h: HTTPHeaders = {};
            if (ACCESS_TOKEN) h.authorization = `Bearer ${ACCESS_TOKEN}`;
            return h;
          },
        }),
      ],
    };
  },
  ssr: false,
});
