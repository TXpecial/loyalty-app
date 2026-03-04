import { Suspense } from "react";
import { AuthForm } from "./AuthForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-sm text-slate-300">
            Φόρτωση φόρμας σύνδεσης...
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}

