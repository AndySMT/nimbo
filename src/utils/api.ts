import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "@/server/api/root";
import superjson from "superjson";
import { httpLink, loggerLink } from "@trpc/client";

let ACCESS_TOKEN = "";
export const setAccessToken = (t: string) => {
  ACCESS_TOKEN = t || "";
};

export const api = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
        // usa POST JSON (evita i problemi visti con GET/querystring)
        httpLink({
          url: "/api/trpc",
          // @ts-expect-error alcune versioni non tipano 'method'
          method: "POST",
          headers() {
            return ACCESS_TOKEN
              ? { authorization: `Bearer ${ACCESS_TOKEN}` }
              : {};
          },
        } as any),
      ],
    };
  },
  ssr: false,
});
