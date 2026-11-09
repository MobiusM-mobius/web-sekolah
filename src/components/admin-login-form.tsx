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
      const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false, callbackUrl: "/admin" });
      if (!result || result.error) { setError("Email atau kata sandi tidak sesuai. Setelah beberapa kali gagal, tunggu 15 menit sebelum mencoba lagi."); return; }
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form method="post" onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget)); }} className="space-y-5">
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
      <div><label htmlFor="password" className="label">Kata sandi</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {error && <p role="alert" className="rounded-xl bg-clay-50 p-3 text-sm font-semibold text-clay-700">{error}</p>}
      <button type="submit" disabled={isPending} className="btn btn-primary w-full">{isPending ? "Memeriksa akun" : "Masuk"}</button>
    </form>
  );
}
