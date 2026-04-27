'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './register.module.css';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/app/lib/api';
import toast from 'react-hot-toast';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMarketing = searchParams.get('marketing') === 'true';
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      login(data);
      if (sessionStorage.getItem('pendingJobDescription')) {
        toast.success('Account created! Please re-upload your resume to finish your analysis.');
        router.push('/analyse');
      } else {
        toast.success('Account created successfully!');
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create account');
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    
    // Validations
    if (!form.username.trim().includes(' ')) {
      toast.error('Please enter your full name (first and last name).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    if (!/[A-Z]/.test(form.password)) {
      toast.error('Password must contain at least one uppercase letter.');
      return;
    }
    
    if (!/[0-9]/.test(form.password)) {
      toast.error('Password must contain at least one number.');
      return;
    }

    registerMutation.mutate({ username: form.username, email: form.email, password: form.password });
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <Link href="/" className={styles.logo}>◆ ResumeAI</Link>
        </div>
        
        {isMarketing && (
          <div className="badge badge-purple" style={{ marginBottom: 16, fontSize: '0.85rem', display: 'inline-flex' }}>
            Sign up to see your AI analysis results!
          </div>
        )}

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start analysing resumes for free. No credit card needed.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Full Name</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Praneeth Kumar"
              className="form-input"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
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
              placeholder="Min. 8 characters"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Error display removed in favor of toast */}

          <button
            type="submit"
            className="btn-primary"
            disabled={registerMutation.isPending}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {registerMutation.isPending ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
          </button>

          <p className={styles.terms}>
            By signing up you agree to our terms of service and privacy policy.
          </p>
        </form>

        <div className={styles.divider}><span>Already have an account?</span></div>
        <Link href="/login" className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
