import type { GetServerSideProps } from "next";
import { useState } from "react";
import { api } from "@/utils/api";

type Props = { accessToken: string | null };

export default function AuthenticatedPage({ accessToken }: Props) {
  // === tRPC: lettura lista quest ===
  const quests = api.quests.list.useQuery(undefined, {
    enabled: !!accessToken, // evita chiamate senza token
  });

  // === tRPC: submit risposta & reset ===
  const submit = api.quests.submit.useMutation({
    onSuccess: () => quests.refetch(),
  });
  const reset = api.quests.reset.useMutation({
    onSuccess: () => quests.refetch(),
  });

  // Stato locale degli input
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const onChangeAnswer = (id: string, val: string) =>
    setAnswers((s) => ({ ...s, [id]: val }));

  const onSubmit = (id: string) => {
    const raw = answers[id];
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      alert("Inserisci un numero valido");
      return;
    }
    submit.mutate({ id, answer: n });
  };

  // ---- Estrattore robusto (supporta payload incapsulato in { json: ... })
  const root = (quests.data as any) ?? null;
  const payload = root?.json ?? root;

  type Quest = {
    id: string;
    prompt: string;
    answer: number;
    completed: boolean;
    reward: number;
  };

  const list: Quest[] = Array.isArray(payload?.quests) ? payload.quests : [];
  const points: number =
    typeof payload?.points === "number" ? payload.points : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Area autenticata (token: {accessToken ?? "—"})
        </h1>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900">
              Quests matematiche
            </h2>
            <button
              onClick={() => {
                if (confirm("Sicuro di resettare il progresso?"))
                  reset.mutate();
              }}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
              disabled={reset.isLoading}
            >
              Reset
            </button>
          </div>

          {/* Stato richiesta */}
          {quests.isLoading && (
            <p className="mb-2 text-sm text-slate-500">Caricamento…</p>
          )}
          {quests.error && (
            <div className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Errore tRPC: {quests.error.message}
            </div>
          )}

          {/* DEBUG rapido: mostra dati grezzi (se serve) */}
          {/* <pre className="mb-3 max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
            {JSON.stringify(payload, null, 2)}
          </pre> */}

          <p className="mb-4 text-sm text-slate-600">
            Punti: <span className="font-semibold">{points}</span> — Quests:{" "}
            <span className="font-mono">{list.length}</span>
          </p>

          <ul className="space-y-3">
            {list.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      q.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    title={q.completed ? "Completata" : "Da fare"}
                  >
                    {q.completed ? "✓" : "…"}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{q.prompt}</div>
                    <div className="text-xs text-slate-500">
                      Ricompensa: {q.reward} punti
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    disabled={q.completed || submit.isLoading}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                    placeholder="risposta"
                    className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 text-slate-900"
                  />
                  <button
                    disabled={q.completed || submit.isLoading}
                    onClick={() => onSubmit(q.id)}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Invia
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Feedback ultima submit (opzionale) */}
          {submit.data && (
            <>
              <pre className="mt-4 max-h-60 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                {JSON.stringify(submit.data, null, 2)}
              </pre>
              <div>
                {submit.data.ok
                  ? "Risposta corretta! 🎉"
                  : `Risposta errata: ${submit.data}`}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

// Legge il token dall'URL e lo passa come prop (SSR)
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = (ctx.query?.token as string) || null; // <— legge ?token=...
  return { props: { accessToken: token } }; // <— legge ?token=...
};
