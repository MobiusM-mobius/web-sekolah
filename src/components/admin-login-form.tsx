"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false, redirectTo: "/admin" });
      if (result?.error) setError("Email atau kata sandi tidak sesuai.");
      else router.push("/admin");
    });
  }
  return <form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget)); }} className="space-y-4"><label className="block text-sm font-bold">Email<input name="email" type="email" required autoComplete="username" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-school-blue" /></label><label className="block text-sm font-bold">Kata sandi<input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-school-blue" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={isPending} className="btn-primary w-full disabled:opacity-60">{isPending ? "Memeriksa..." : "Masuk dashboard"}</button></form>;
}
