"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });
    return unsubscribe;
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-opay-green">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <p className="text-[13px] text-text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
