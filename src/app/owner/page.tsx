"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "@/lib/supabase-client";

const QR_REGION_ID = "owner-qr-scanner-region";

export default function OwnerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCustomerId, setScannedCustomerId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [giftText, setGiftText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<
    {
      id: string;
      customer_id: string;
      description: string | null;
      created_at: string;
      status: string | null;
    }[]
  >([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  useEffect(() => {
    const loadOwner = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }
      setOwnerId(data.user.id);
    };

    loadOwner();
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      QR_REGION_ID,
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        const match = decodedText.match(/^LOYALTY:(.+)$/);
        const customerId = match ? match[1] : decodedText;
        setScannedCustomerId(customerId);
        setIsModalOpen(true);
        setIsScanning(false);
        scanner.clear().catch(() => {
          // ignore cleanup errors
        });
      },
      () => {
        // ignore scan errors to keep UI clean
      },
    );

    return () => {
      scanner.clear().catch(() => {
        // ignore cleanup errors
      });
    };
  }, [isScanning]);

  useEffect(() => {
    const fetchRecentUsed = async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("status", "used")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentRedemptions(data as typeof recentRedemptions);
      }
    };

    const channel = supabase
      .channel("owner-recent-redemptions")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rewards",
        },
        (payload) => {
          const next = payload.new as (typeof recentRedemptions)[number];
          if (next.status === "used") {
            setRecentRedemptions((prev) => {
              const existingWithout = prev.filter((r) => r.id !== next.id);
              return [next, ...existingWithout].slice(0, 5);
            });
          }
        },
      )
      .subscribe();

    fetchRecentUsed();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStartScanning = () => {
    if (!hasCameraPermission) {
      setScannerError(
        'Πρέπει πρώτα να πατήσετε "Ενεργοποίηση Κάμερας" και να δώσετε άδεια πρόσβασης.',
      );
      return;
    }

    setScannerError(null);
    setGiftText("");
    setScannedCustomerId(null);
    setIsScanning(true);
  };

  const handleEnableCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setScannerError(
        "Η κάμερα δεν είναι διαθέσιμη σε αυτή τη συσκευή ή τον browser.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasCameraPermission(true);
      setScannerError(null);
    } catch (err) {
      setScannerError(
        "Δεν δόθηκε άδεια πρόσβασης στην κάμερα. Ελέγξτε τα permissions του browser.",
      );
    }
  };

  const handleSendGift = async () => {
    if (!scannedCustomerId || !giftText.trim()) {
      setErrorMessage("Συμπληρώστε πρώτα το δώρο που θέλετε να στείλετε.");
      return;
    }

    if (!ownerId) {
      setErrorMessage(
        "Δεν βρέθηκε ενεργός ιδιοκτήτης. Παρακαλώ συνδεθείτε ξανά.",
      );
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    const { error } = await supabase.from("rewards").insert({
      customer_id: scannedCustomerId,
      description: giftText.trim(),
      status: "pending",
      owner_id: ownerId,
    });

    setIsSending(false);

    if (error) {
      setErrorMessage(
        "Κάτι πήγε στραβά κατά την αποστολή. Δοκιμάστε ξανά σε λίγο.",
      );
      return;
    }

    setIsModalOpen(false);
    setGiftText("");
  };

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
          <section className="space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Πίνακας Ιδιοκτήτη
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Διαχείριση Επιβράβευσης Πελατών
              </h1>
              <p className="text-sm text-slate-300 md:text-base">
                Ξεκινήστε σκανάρισμα QR για να αναγνωρίσετε τον πελάτη και να
                του στείλετε άμεσα ένα δώρο ή πόντους.
              </p>
            </header>

            <div className="mt-4 rounded-2xl bg-black/40 px-4 py-3 text-xs text-slate-300 ring-1 ring-white/10">
              <p className="font-medium text-slate-100">
                Πώς λειτουργεί το Scanner;
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Πατήστε πρώτα &quot;Ενεργοποίηση Κάμερας&quot; για να δώσετε
                άδεια και στη συνέχεια &quot;Έναρξη Σκαναρίσματος&quot; για να
                σκανάρετε το QR του πελάτη.
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleEnableCamera}
                className="inline-flex items-center justify-center rounded-full border border-emerald-500/60 bg-black/40 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-sm shadow-emerald-500/30 transition hover:border-emerald-400 hover:bg-slate-900"
              >
                Ενεργοποίηση Κάμερας
              </button>

              <button
                type="button"
                onClick={handleStartScanning}
                disabled={isScanning}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isScanning ? "Σκανάρει..." : "Έναρξη Σκαναρίσματος"}
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-white md:text-base">
              Ζωντανό Scanner
            </h2>
            <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-slate-700 bg-black/70">
              <div
                id={QR_REGION_ID}
                className="flex h-full items-center justify-center text-xs text-slate-500"
              >
                {!isScanning && (
                  <span>
                    Πατήστε &quot;Έναρξη Σκαναρίσματος&quot; για να
                    ενεργοποιηθεί η κάμερα.
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Συνίσταται χρήση από συσκευή με κάμερα (κινητό ή tablet) και
              καλό φωτισμό στον χώρο.
            </p>
            {scannerError && (
              <p className="text-[11px] text-rose-400">{scannerError}</p>
            )}
          </section>

          <section className="space-y-3 md:col-span-2">
            <h2 className="text-sm font-semibold text-white md:text-base">
              Πρόσφατες Εξαργυρώσεις
            </h2>
            {recentRedemptions.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-black/40 px-4 py-4 text-sm text-slate-300">
                Δεν υπάρχουν ακόμη εξαργυρωμένα δώρα.
              </div>
            ) : (
              <ul className="grid gap-2 md:grid-cols-2">
                {recentRedemptions.map((reward) => (
                  <li
                    key={reward.id}
                    className="rounded-2xl border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50"
                  >
                    <p className="font-medium">
                      {reward.description ?? "Εξαργυρωμένο δώρο"}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-200/80">
                      Πελάτης:{" "}
                      <span className="font-mono">{reward.customer_id}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-200/70">
                      Χρόνος:{" "}
                      {new Date(reward.created_at).toLocaleString("el-GR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {isModalOpen && scannedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/60">
            <h2 className="text-lg font-semibold text-white">
              Σκανάρατε τον Πελάτη:
            </h2>
            <p className="mt-1 font-mono text-sm text-emerald-300">
              {scannedCustomerId}
            </p>

            <label className="mt-5 block text-sm font-medium text-slate-200">
              Τι δώρο θέλετε να στείλετε;
              <textarea
                rows={3}
                value={giftText}
                onChange={(e) => setGiftText(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-emerald-500/40 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="Π.χ. 10% έκπτωση στην επόμενη αγορά, 1 δωρεάν καφές..."
              />
            </label>

            {errorMessage && (
              <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>
            )}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Άκυρο
              </button>
              <button
                type="button"
                onClick={handleSendGift}
                disabled={isSending}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? "Αποστολή..." : "Αποστολή"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

