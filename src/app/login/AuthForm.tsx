"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

type AuthMode = "login" | "signup";
type Role = "owner" | "customer";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        const user = data.user;
        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            role,
          });
        }

        document.cookie =
          "loyalty_session=1; path=/; max-age=604800; samesite=lax";

        const target =
          redirectTo ?? (role === "owner" ? "/owner" : "/customer");
        router.push(target);
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Αποτυχία σύνδεσης. Δοκιμάστε ξανά.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const profileRole = (profile?.role as Role | undefined) ?? "customer";

      document.cookie =
        "loyalty_session=1; path=/; max-age=604800; samesite=lax";

      const target =
        redirectTo ?? (profileRole === "owner" ? "/owner" : "/customer");
      router.push(target);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {mode === "login" ? "Είσοδος" : "Εγγραφή"}
          </h1>
          <p className="text-xs text-slate-400">
            Συνδεθείτε με το email σας για να διαχειριστείτε τις επιβραβεύσεις.
          </p>
        </div>

        <div className="mb-4 inline-flex w-full rounded-full bg-slate-900/80 p-1 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
              mode === "login"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            Είσοδος
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
              mode === "signup"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            Εγγραφή
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-emerald-500/40 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-slate-200">
              Κωδικός πρόσβασης
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-emerald-500/40 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2 text-left">
              <p className="text-xs font-medium text-slate-200">
                Τύπος λογαριασμού
              </p>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-left ${
                    role === "customer"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                >
                  <span className="block font-semibold">Πελάτης</span>
                  <span className="text-[11px] text-slate-400">
                    Προβολή QR & δώρων
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-left ${
                    role === "owner"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                >
                  <span className="block font-semibold">Ιδιοκτήτης</span>
                  <span className="text-[11px] text-slate-400">
                    Scanner & αποστολή δώρων
                  </span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Επεξεργασία..."
              : mode === "login"
                ? "Σύνδεση"
                : "Δημιουργία λογαριασμού"}
          </button>
        </form>
      </div>
    </div>
  );
}

