'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>◆</span>
          <span className="gradient-text">ResumeAI</span>
        </Link>

        {/* Mobile menu button */}
        <button className={styles.mobileMenuBtn} onClick={toggleMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`${styles.right} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/analyse"
                className={`${styles.navLink} ${pathname === '/analyse' ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Analyse
              </Link>
              <div className={styles.userChip}>
                <span className={styles.avatar}>{user.username?.[0]?.toUpperCase() || 'U'}</span>
                <span className={styles.userName}>{user.username}</span>
              </div>
              <button 
                onClick={() => { logout(); closeMenu(); }} 
                className="btn-ghost" 
                style={{ fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/analyse"
                className={`${styles.navLink} ${pathname === '/analyse' ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Analyse
              </Link>
              <Link href="/login" className="btn-ghost" onClick={closeMenu}>Log In</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.9rem' }} onClick={closeMenu}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
