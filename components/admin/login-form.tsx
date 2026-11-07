"use client";

import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";

export function LoginForm({
  next,
  defaultEmail,
}: {
  next: string;
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/careers/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      let payload: { error?: string; redirect?: string } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setError(payload.error ?? "Sign-in failed. Please try again.");
        setPending(false);
        return;
      }

      const target = payload.redirect || "/admin";
      const dest = target.startsWith("/careers") ? target : `/careers${target}`;
      window.location.href = dest;
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error ? (
        <div
          role="alert"
          className="border border-[#f0ccd3] bg-[#fdf3f5] px-4 py-3 text-[12px] leading-5 text-brand"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="you@malatigroup.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input pr-11"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-ink px-5 text-[13px] font-medium text-white transition-colors hover:bg-black disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" />
            Sign in to admin
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-5 text-muted">
        Access is restricted to authorised Malati Group recruitment staff.
      </p>
    </form>
  );
}
