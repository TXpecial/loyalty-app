import Link from "next/link";
import { Store, User2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur-md md:flex-row md:items-center md:gap-14 md:p-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3 w-3" />
            <span>Next.js Loyalty Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Εφαρμογή Επιβράβευσης
              <span className="block text-emerald-400">
                που αγαπούν πελάτες & καταστήματα
              </span>
            </h1>
            <p className="max-w-xl text-sm text-slate-300 md:text-base">
              Δημιουργήστε το δικό σας ψηφιακό πρόγραμμα επιβράβευσης με QR
              κάρτες, πόντους και εξαργύρωση. Ξεκινήστε επιλέγοντας τον ρόλο
              σας.
            </p>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-medium text-white">Γρήγορο στήσιμο</p>
              <p className="mt-1 text-xs text-slate-400">
                Δημιουργία προγράμματος επιβράβευσης μέσα σε λίγα λεπτά.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-medium text-white">QR Κάρτες</p>
              <p className="mt-1 text-xs text-slate-400">
                Μοναδικοί κωδικοί για κάθε πελάτη, έτοιμοι για σκανάρισμα.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-medium text-white">Στατιστικά</p>
              <p className="mt-1 text-xs text-slate-400">
                Παρακολούθηση πόντων, επισκέψεων και εξαργυρώσεων (σύντομα).
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-black/60">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Επιλέξτε ρόλο
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Πώς θέλετε να χρησιμοποιήσετε το Loyalty App;
            </h2>

            <div className="mt-6 space-y-4">
              <Link
                href="/owner"
                className="group flex items-center justify-between gap-4 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/80 text-slate-950">
                    <Store className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <p>Είστε Ιδιοκτήτης;</p>
                    <p className="text-xs font-normal text-emerald-950/80">
                      Δημιουργήστε πρόγραμμα επιβράβευσης για το κατάστημά σας.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-950/70 group-hover:translate-x-0.5 group-hover:text-emerald-900">
                  Συνέχεια →
                </span>
              </Link>

              <Link
                href="/customer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-emerald-300">
                    <User2 className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <p>Είστε Πελάτης;</p>
                    <p className="text-xs font-normal text-slate-300/80">
                      Συνδέστε ή δημιουργήστε την ψηφιακή κάρτα επιβράβευσής σας.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-300">
                  Συνέχεια →
                </span>
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Δεν απαιτείται εγκατάσταση εφαρμογής. Όλα λειτουργούν από τον
              browser, σε κινητό, tablet ή υπολογιστή.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
