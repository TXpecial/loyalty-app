"use client";

export default function OwnerScannerPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Scanner QR Πελατών
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Σε αυτή τη σελίδα θα ενσωματωθεί ο ζωντανός QR scanner μέσω
            κάμερας, χρησιμοποιώντας την βιβλιοθήκη <code>html5-qrcode</code>.
            Προς το παρόν λειτουργεί ως placeholder ώστε να συνδέεται σωστά το
            κουμπί από τον πίνακα Ιδιοκτήτη.
          </p>

          <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-emerald-500/40 bg-slate-900/80 text-center text-sm text-slate-400">
            Περιοχή Scanner – θα γεμίσει με live preview από την κάμερα και
            αποτελέσματα σκαναρίσματος σε επόμενο βήμα.
          </div>
        </div>
      </div>
    </div>
  );
}

