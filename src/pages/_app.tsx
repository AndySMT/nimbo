import type { AppType } from "next/app";
import { api, setAccessToken } from "@/utils/api";
import "@/styles/globals.css";

const App: AppType<{ accessToken?: string | null }> = ({
  Component,
  pageProps,
}) => {
  setAccessToken(pageProps.accessToken ?? ""); // lo useremo negli header tRPC
  return <Component {...pageProps} />;
};

export default api.withTRPC(App);
