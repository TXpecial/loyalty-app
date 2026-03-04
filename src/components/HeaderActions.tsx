"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export function HeaderActions() {
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      setHasSession(!!data.user);
    };

    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "loyalty_session=; path=/; max-age=0; samesite=lax";
    router.push("/login");
  };

  if (!hasSession) return null;

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-700 bg-black/40 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:bg-slate-900"
    >
      Log out
    </button>
  );
}

