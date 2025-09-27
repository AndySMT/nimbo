import type { AppProps } from "next/app";
import { api, setAccessToken } from "@/utils/api";
import "@/styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  // se in pagina passiamo accessToken (da getServerSideProps) lo mettiamo nell’header tRPC
  const anyProps = pageProps as any;
  if (anyProps?.accessToken) setAccessToken(anyProps.accessToken);

  return <Component {...pageProps} />;
}

export default api.withTRPC(App);
