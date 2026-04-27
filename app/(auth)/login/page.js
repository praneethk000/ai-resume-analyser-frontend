'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/app/lib/api';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data);
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.response?.data?.message || error.message);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email: form.email, password: form.password });
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <Link href="/" className={styles.logo}>◆ ResumeAI</Link>
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
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
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
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

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loginMutation.isPending}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {loginMutation.isPending ? <><span className="spinner" style={{width: 14, height: 14, marginRight: 8, borderTopColor: 'transparent'}}/> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Don&apos;t have an account?</span>
        </div>
        <Link href="/register" className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
