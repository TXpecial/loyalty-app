"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User2 } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export function HeaderActions() {
  const [hasSession, setHasSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      setHasSession(!!data.user);
      setUserEmail(data.user?.email ?? null);
    };

    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "loyalty_session=; path=/; max-age=0; samesite=lax";
    router.push("/login");
  };

  if (!hasSession) return null;

  const avatarInitial =
    userEmail && userEmail.length > 0
      ? userEmail[0].toUpperCase()
      : null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 shadow-md shadow-black/40 ring-1 ring-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 text-sm font-semibold text-slate-950">
          {avatarInitial ? (
            avatarInitial
          ) : (
            <User2 className="h-4 w-4" />
          )}
        </div>
        {userEmail && (
          <div className="hidden max-w-[150px] flex-col text-xs leading-tight text-slate-100 sm:flex">
            <span className="truncate font-medium">{userEmail}</span>
            <span className="text-[11px] text-emerald-300/80">
              Συνδεδεμένος χρήστης
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-black/40 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-md shadow-black/40 transition hover:border-emerald-400 hover:bg-slate-900"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Αποσύνδεση</span>
      </button>
    </div>
  );
}

