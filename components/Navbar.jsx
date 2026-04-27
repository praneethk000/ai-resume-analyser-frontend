'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◆</span>
          <span className="gradient-text">ResumeAI</span>
        </Link>

        <div className={styles.right}>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/analyse"
                className={`${styles.navLink} ${pathname === '/analyse' ? styles.active : ''}`}
              >
                Analyse
              </Link>
              <div className={styles.userChip}>
                <span className={styles.avatar}>{user.username?.[0]?.toUpperCase() || 'U'}</span>
                <span className={styles.userName}>{user.username}</span>
              </div>
              <button onClick={logout} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log In</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.9rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
