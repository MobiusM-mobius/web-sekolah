"use client";

import { signOut } from "next-auth/react";

export function AdminSignOut() {
  return <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl border border-slate-200 px-4 py-2 font-bold">Keluar</button>;
}
