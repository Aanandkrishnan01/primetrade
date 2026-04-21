"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.fullName || undefined
      );
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">⚡</div>
          <h1>Create Account</h1>
          <p>Join PrimeTrade and start managing tasks</p>
        </div>

        {error && (
          <div
            className="toast toast-error"
            style={{ position: "relative", top: 0, right: 0, marginBottom: 16, animation: "none" }}
          >
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => updateField("username", e.target.value)}
              required
              minLength={3}
              pattern="^[a-zA-Z0-9_]+$"
              title="Only letters, numbers, and underscores"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: 8 }}>
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
