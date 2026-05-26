"use client";

import { useActionState, useState, useEffect } from "react";
import { Eye, EyeOff, Package, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { login } from "@/app/lib/auth/actions";
import type { LoginFormState } from "@/app/lib/types/auth";

const initialState: LoginFormState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="login-root">
      {/* Background gradient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Card */}
      <div
        className={`login-card ${mounted ? "login-card--visible" : ""}`}
        role="main"
      >
        {/* Logo + Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <Package className="login-logo-icon" />
          </div>
          <div>
            <h1 className="login-title">Tetap Usaha</h1>
            <p className="login-subtitle">Inventory Management System</p>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h2 className="login-heading">Selamat Datang</h2>
          <p className="login-desc">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Error message */}
        {state?.error && (
          <div className="login-error" role="alert">
            <AlertCircle className="login-error-icon" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="login-form" noValidate>
          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username" className="login-label">
              Username
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              placeholder="Masukkan username"
              className="login-input"
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              Password
            </label>
            <div className="login-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Masukkan password"
                className="login-input login-input--password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="login-eye-btn"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="login-remember">
            <input
              id="login-remember"
              name="remember"
              type="checkbox"
              className="login-checkbox"
              disabled={isPending}
            />
            <span className="login-remember-label">Ingat saya</span>
          </label>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="login-btn"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          © {new Date().getFullYear()} Tetap Usaha · All rights reserved
        </p>
      </div>
    </div>
  );
}
