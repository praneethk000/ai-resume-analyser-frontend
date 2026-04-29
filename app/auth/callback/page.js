'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/app/lib/axios';

/**
 * OAuth2 Callback Page — /auth/callback
 *
 * Spring Boot's OAuth2SuccessHandler redirects here after a successful
 * Google login:  http://localhost:3000/auth/callback?token=<jwt>
 *
 * Flow:
 *   1. Read `?token` from URL.
 *   2. Temporarily write token to localStorage so the axios interceptor
 *      can attach it as `Authorization: Bearer <token>` on the next call.
 *   3. GET /web/api/auth/v1/me  → returns { userId, username, email }.
 *   4. Call login() from AuthContext (persists everything).
 *   5. Redirect to /dashboard.
 */
function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.replace('/login?error=MissingToken');
      return;
    }

    async function resolveUser() {
      try {
        // Temporarily store so axios interceptor can send Bearer header
        localStorage.setItem('resumeai_token', token);

        const res = await api.get('/web/api/auth/v1/me');
        const { userId, username, email } = res.data;

        // Commit to AuthContext (also writes user object to localStorage)
        login({ token, userId, username, email });

        router.replace('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        localStorage.removeItem('resumeai_token');
        router.replace('/login?error=OAuthFailed');
      }
    }

    resolveUser();
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      background: 'var(--bg-primary)',
      padding: '24px',
    }}>
      {/* Animated glow behind spinner */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
        <div className="spinner" style={{ width: 44, height: 44, position: 'relative' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          color: 'var(--text-primary)',
          fontSize: '1.1rem',
          fontWeight: 600,
          marginBottom: 6,
        }}>
          Signing you in with Google…
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Just a moment, setting up your account
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
