'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/app/lib/api';
import toast from 'react-hot-toast';
import OAuthLoginButton, { OrDivider } from '@/app/components/OAuthLoginButton';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!form.password) {
      toast.error('Please enter your password.');
      return;
    }
    loginMutation.mutate({ email: form.email, password: form.password });
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <Link href="/" className={styles.logo}>◆ ResumeAI</Link>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue to your dashboard</p>

        {/* ── Google OAuth (primary CTA) ── */}
        <OAuthLoginButton label="Continue with Google" />

        {/* ── OR divider ── */}
        <OrDivider text="or" />

        {/* ── Email / password form ── */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Your password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            id="login-submit-btn"
            disabled={loginMutation.isPending}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {loginMutation.isPending
              ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} /> Signing in…</>
              : 'Sign in with Email'}
          </button>
        </form>

        {/* ── Footer link ── */}
        <div className={styles.divider}>
          <span>Don&apos;t have an account?</span>
        </div>
        <Link
          href="/register"
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
