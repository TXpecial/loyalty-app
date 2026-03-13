"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Reward = {
  id: string;
  customer_id: string;
  description: string | null;
  created_at: string;
  status: string | null;
};

export default function CustomerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [recentlyRedeemedId, setRecentlyRedeemedId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }
      setUserId(data.user.id);
      setUserEmail(data.user.email ?? null);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchRewards = async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRewards(data as Reward[]);
      }
      setLoadingRewards(false);
    };

    const setupRealtime = () => {
      channel = supabase
        .channel("rewards-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "rewards",
            filter: `customer_id=eq.${userId}`,
          },
          (payload) => {
            setRewards((prev) => [payload.new as Reward, ...prev]);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rewards",
            filter: `customer_id=eq.${userId}`,
          },
          (payload) => {
            const updated = payload.new as Reward;
            setRewards((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            );
          },
        )
        .subscribe();
    };

    fetchRewards();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  const handleRedeem = async (reward: Reward) => {
    if (reward.status === "used") return;

    const confirm = window.confirm(
      "Θέλετε να εξαργυρώσετε αυτό το δώρο τώρα μπροστά στον υπάλληλο;",
    );
    if (!confirm) return;

    setRedeemingId(reward.id);

    const { error } = await supabase
      .from("rewards")
      .update({ status: "used" })
      .eq("id", reward.id);

    setRedeemingId(null);

    if (!error) {
      setRecentlyRedeemedId(reward.id);
      setTimeout(() => setRecentlyRedeemedId(null), 2000);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
      <main className="w-full max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
          <section className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Περιοχή Πελάτη
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Καλώς ήρθες, {userEmail ?? "Πελάτη"}
              </h1>
              <p className="text-sm text-slate-300 md:text-base">
                Αυτή είναι η ψηφιακή κάρτα επιβράβευσής σου. Δείξε το QR code
                στο ταμείο για να μαζεύεις πόντους και να εξαργυρώνεις δώρα.
              </p>
            </header>

            <div className="mt-3 inline-flex flex-col gap-1 rounded-2xl bg-black/40 px-4 py-3 text-xs text-slate-300 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-100">
                  ID Πελάτη
                </span>
                <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-[11px] text-emerald-300">
                  {userId ?? "—"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Στην πραγματική εφαρμογή, εδώ θα εμφανίζεται το ID του
                συνδεδεμένου λογαριασμού σου.
              </p>
            </div>

            <section className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold text-white md:text-base">
                Οι Ανταμοιβές μου
              </h2>
              {loadingRewards ? (
                <div className="rounded-2xl border border-slate-700 bg-black/40 px-4 py-5 text-sm text-slate-300">
                  Φόρτωση ανταμοιβών...
                </div>
              ) : rewards.filter((r) => r.status !== "used").length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-600 bg-black/40 px-4 py-5 text-sm text-slate-300">
                  <p>Δεν έχετε ακόμη καταχωρημένες ανταμοιβές.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Μόλις ο ιδιοκτήτης σκανάρει το QR σας και σας αποδώσει ένα
                    δώρο, θα εμφανιστεί εδώ.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {rewards
                    .filter((reward) => reward.status !== "used")
                    .map((reward) => (
                    <li
                      key={reward.id}
                      className="relative flex items-start justify-between gap-3 rounded-2xl border border-slate-700 bg-black/40 px-4 py-3 text-sm text-slate-100"
                    >
                      <div>
                        <p className="font-medium">
                          {reward.description ?? "Νέα ανταμοιβή"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(reward.created_at).toLocaleString("el-GR")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRedeem(reward)}
                        disabled={redeemingId === reward.id}
                        className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {redeemingId === reward.id
                          ? "Εξαργύρωση..."
                          : "Εξαργύρωση τώρα"}
                      </button>

                      {recentlyRedeemedId === reward.id && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-slate-950 animate-bounce">
                            ✓
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {rewards.filter((r) => r.status === "used").length > 0 && (
              <section className="mt-4 space-y-3">
                <h2 className="text-sm font-semibold text-slate-200 md:text-base">
                  Ιστορικό
                </h2>
                <ul className="space-y-2">
                  {rewards
                    .filter((reward) => reward.status === "used")
                    .map((reward) => (
                      <li
                        key={reward.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-700/70 bg-black/30 px-4 py-3 text-sm text-slate-400"
                      >
                        <div>
                          <p className="font-medium text-slate-300 line-through">
                            {reward.description ?? "Εξαργυρωμένο δώρο"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(
                              reward.created_at,
                            ).toLocaleString("el-GR")}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                          Used
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </section>

          <section className="flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-xs rounded-[28px] bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.65)] ring-1 ring-emerald-500/40 backdrop-blur-md">
              <div className="relative overflow-hidden rounded-3xl bg-slate-950/80 p-4">
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
                <header className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      Loyalty Digital Card
                    </span>
                    <span className="mt-1 text-sm font-medium text-slate-50">
                      {userEmail ?? "Πελάτης Loyalty"}
                    </span>
                  </div>
                  <div className="flex h-8 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/90 to-cyan-400/90 text-[10px] font-semibold text-slate-950 shadow-md shadow-emerald-500/40">
                    QR PASS
                  </div>
                </header>

                <div className="rounded-2xl bg-white/95 p-3 shadow-inner shadow-slate-400/40">
                  {userId && (
                    <QRCodeSVG
                      value={`LOYALTY:${userId}`}
                      size={184}
                      level="M"
                      includeMargin
                    />
                  )}
                </div>

                <footer className="mt-4 flex items-center justify-between gap-3 text-[11px] text-slate-300">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100">
                      QR Κάρτα Επιβράβευσης
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-400">
                      Δείξτε την κάρτα στο ταμείο σε κάθε επίσκεψη.
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-[10px] text-emerald-300/80">
                    <span className="uppercase tracking-[0.16em]">Status</span>
                    <span className="mt-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                      Ενεργή
                    </span>
                  </div>
                </footer>
              </div>
            </div>
            <p className="max-w-xs text-center text-xs text-slate-400">
              Σκανάρετε αυτή την ψηφιακή κάρτα στο κατάστημα για να
              καταχωρηθεί η επίσκεψη ή η αγορά σας.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

