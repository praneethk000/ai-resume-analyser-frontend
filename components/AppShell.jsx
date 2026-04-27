'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiGrid, FiClock, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import styles from './AppShell.module.css';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Auth guard: redirect to /login if not authenticated ──────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Show a full-screen spinner while we rehydrate auth from localStorage
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', Icon: FiGrid },
    { href: '/history',   label: 'History',  Icon: FiClock },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={styles.shell}>
      {/* ── Mobile Header (only visible on mobile) ── */}
      <div className={styles.mobileHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoDiamond}>◆</span>
          <span>ResumeAI</span>
        </Link>
        <button onClick={handleLogout} className={styles.mobileLogoutBtn} aria-label="Sign Out">
          <FiLogOut size={20} />
        </button>
      </div>

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoDiamond}>◆</span>
            <span>ResumeAI</span>
          </Link>

          <nav className={styles.nav}>
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${pathname === href ? styles.navActive : ''}`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userChip}>
            <div className={styles.avatar}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userMeta}>
              <p className={styles.userName}>{user?.username || 'User'}</p>
              <p className={styles.userEmail}>{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            <FiLogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className={styles.bottomNav}>
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.bottomNavItem} ${pathname === href ? styles.bottomNavActive : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
