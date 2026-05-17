// PURPOSE: Provides a functional local login screen for protecting internal admin routes during initialization.
// USAGE: Rendered by the `/login` route and calls `onLogin` after validating local form input.

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { ROUTES } from "../utils/constants";

export function LoginPage({ session, onLogin }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || ROUTES.dashboard;

  if (session?.isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (userName.trim().length < 2 || password.trim().length < 4) {
      setFormError("Enter a valid name and a password with at least 4 characters.");
      return;
    }

    onLogin(userName.trim());
    navigate(from, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardBody className="p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {import.meta.env.VITE_APP_NAME || "GodownAdmin"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Warehouse sign in</h1>
            <p className="mt-2 text-sm text-slate-500">
              Access the mobile-first godown operations console.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                className="mt-1 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                autoComplete="username"
                placeholder="Store manager"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                type="password"
                autoComplete="current-password"
                placeholder="Local access code"
              />
            </label>

            {formError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
