'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiFileText, FiSearch, FiAward, FiZap, FiPlusCircle, FiDownload, FiMail
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/AppShell';
import ResumeCard from '@/components/ResumeCard';
import styles from './dashboard.module.css';

import { getResumesByUser, getAllAnalysesByUser } from '../lib/api';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: resumes = [], isLoading: resumesLoading, isError: resumesError } = useQuery({
    queryKey: ['resumes', user?.userId],
    queryFn: () => getResumesByUser(user.userId),
    enabled: !!user?.userId,
  });

  const { data: analyses = [], isLoading: analysesLoading, isError: analysesError } = useQuery({
    queryKey: ['analyses', user?.userId],
    queryFn: () => getAllAnalysesByUser(user.userId),
    enabled: !!user?.userId,
  });

  const isLoading = resumesLoading || analysesLoading;
  const isError = resumesError || analysesError;

  // Calculate stats
  const safeAnalyses = Array.isArray(analyses) ? analyses : [];
  const safeResumes = Array.isArray(resumes) ? resumes : [];

  const bestScore = safeAnalyses.length > 0
    ? Math.max(...safeAnalyses.map(a => a.matchScore || 0))
    : 0;

  const uniqueSkills = new Set();
  safeResumes.forEach(r => {
    if (r.skills && Array.isArray(r.skills)) {
      r.skills.forEach(skillName => {
        if (skillName) uniqueSkills.add(skillName.toLowerCase().trim());
      });
    }
  });

  const statsData = [
    { label: 'Resumes Uploaded', value: safeResumes.length.toString(),   Icon: FiFileText },
    { label: 'Analyses Run',     value: safeAnalyses.length.toString(),  Icon: FiSearch   },
    { label: 'Best Match Score', value: `${Math.round(bestScore)}%`, Icon: FiAward    },
    { label: 'Skills Tracked',   value: uniqueSkills.size.toString(),  Icon: FiZap      },
  ];

  function handleAnalyse(resumeId) {
    router.push(`/analyse?resumeId=${resumeId}`);
  }

  return (
    <AppShell>
      <div className={styles.inner}>

        {/* ── Page header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>
              Good {getTimeOfDay()},{' '}
              <span className="gradient-text">
                {user?.username?.split(' ')[0] || 'there'}
              </span>
            </h1>
            <p className={styles.headerSub}>
              Here are all your uploaded resumes. Click <strong>Analyse</strong> on any resume to get started.
            </p>
          </div>
          {/* Single "New Analysis" CTA — for uploading a fresh resume */}
          <Link href="/analyse" className="btn-primary">
            <FiPlusCircle size={16} /> New Analysis
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className={styles.statsGrid}>
          {statsData.map((stat, i) => (
            <div key={stat.label} className={`${styles.statCard} animate-fadeInUp delay-${i + 1}`}>
              <div className={styles.statIconWrap}><stat.Icon size={20} /></div>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── Resume grid ── */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Resumes</h2>
          <span className={styles.resumeCount}>{safeResumes.length} total</span>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Loading your resumes...</p>
          </div>
        ) : isError ? (
          <p style={{ color: 'var(--danger)', padding: '20px' }}>
            Failed to load resumes. Make sure the backend is running.
          </p>
        ) : safeResumes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FiFileText size={40} /></div>
            <h3>No resumes yet</h3>
            <p>Upload your first resume to get started</p>
            <Link href="/analyse" className="btn-primary">
              <FiPlusCircle size={16} /> Upload &amp; Analyse
            </Link>
          </div>
        ) : (
          <div className={styles.resumeGrid}>
            {safeResumes.map((resume, i) => (
              <div key={resume.resumeId} className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`}>
                <ResumeCard resume={resume} onAnalyse={handleAnalyse} />
              </div>
            ))}
          </div>
        )}

        {/* ── Coming Soon Section ── */}
        <div className={styles.sectionHeader} style={{ marginTop: 48 }}>
          <h2 className={styles.sectionTitle}>Coming Soon</h2>
          <span className={styles.resumeCount}>In Development</span>
        </div>
        <div className={styles.resumeGrid}>
          <div className={styles.statCard} style={{ borderStyle: 'dashed', opacity: 0.8 }}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <FiDownload size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: 4 }}>PDF Report Export</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Download your full AI match analysis and skill gap report as a beautifully formatted PDF document.
            </p>
          </div>
          <div className={styles.statCard} style={{ borderStyle: 'dashed', opacity: 0.8 }}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <FiMail size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: 4 }}>AI Cover Letter Generation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Instantly generate a tailored cover letter using your resume and the matched job description.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
