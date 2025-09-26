import { useState } from "react";
import { api } from "@/utils/api";

type Props = { accessToken: string | null };

export default function AuthenticatedPage({ accessToken }: Props) {
  const [echoText, setEchoText] = useState("prova");

  // tRPC query (protetta)
  const hello = api["demo.hello"].useQuery({}, { enabled: !!accessToken });

  // tRPC mutation
  const echoMutation = api["demo.echo"].useMutation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Nimbo — tRPC demo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Token (SSR):{" "}
            <span className="font-mono">{accessToken ?? "(nessuno)"}</span>
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* tRPC hello */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-slate-900">
              tRPC: demo.hello
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => hello.refetch()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Refetch
              </button>
            </div>
            <pre className="mt-4 max-h-60 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {hello.isLoading
                ? "..."
                : JSON.stringify(hello.data ?? hello.error ?? "—", null, 2)}
            </pre>
          </section>

          {/* tRPC echo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-slate-900">
              tRPC: demo.echo (mutation)
            </h2>
            <div className="flex items-center gap-2">
              <input
                value={echoText}
                onChange={(e) => setEchoText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <button
                onClick={() => echoMutation.mutate({ text: echoText })}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Invia
              </button>
            </div>
            <pre className="mt-4 max-h-60 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {echoMutation.isLoading
                ? "..."
                : JSON.stringify(
                    echoMutation.data ?? echoMutation.error ?? "—",
                    null,
                    2
                  )}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps(ctx: any) {
  const token = (ctx.query?.token as string) || null;
  return { props: { accessToken: token } };
}
