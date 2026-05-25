// PURPOSE: Authenticates users in local development mode.
// USAGE: Rendered at /login. Uses useAuth() context.

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || ROUTES.dashboard;

  // Already authenticated → redirect
  if (!loading && user) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch {
      setFormError("Sign in failed. Check your credentials or contact the administrator.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardBody className="p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {import.meta.env.VITE_APP_NAME || "LGA Retail"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">
              Local development access.
            </p>
            <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-700">
              Dev login: admin@lga.local / admin123
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                autoComplete="email"
                placeholder="admin@lga.local"
                disabled={submitting}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={submitting}
              />
            </label>

            {formError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
