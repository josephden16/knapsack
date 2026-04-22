"use client";

import { signInWithGoogle } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return unsubscribe;
  }, [router]);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="w-full max-w-sm p-10 rounded-modal flex flex-col items-center gap-6 bg-surface shadow-elevated">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-opay-green">
            <span className="text-white font-bold text-2xl leading-none">
              K
            </span>
          </div>
          <div className="text-center">
            <h1 className="font-bold text-2xl text-text-primary">KnapSack</h1>
            <p className="mt-1 text-[13px] text-text-muted">
              Funnel-Based Campaign Reporting
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border-default" />

        {/* Sign-in */}
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-sm text-text-secondary text-center">
            Sign in to access your campaign dashboards
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-lg font-semibold text-sm text-white bg-opay-green hover:bg-opay-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                fill="#fff"
              />
              <path
                d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8582-3.0477.8582-2.3441 0-4.3282-1.5832-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                fill="#fff"
                fillOpacity=".9"
              />
              <path
                d="M3.964 10.71C3.7841 10.17 3.6818 9.5945 3.6818 9s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z"
                fill="#fff"
                fillOpacity=".8"
              />
              <path
                d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
                fill="#fff"
                fillOpacity=".7"
              />
            </svg>
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <p className="text-xs text-text-muted text-center">
          KnapSack — OPay Marketing · Campaign Reporting Platform
        </p>
      </div>
    </div>
  );
}
