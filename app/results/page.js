'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FiCheckCircle, FiXCircle, FiArrowLeft,
  FiPlusCircle, FiHome, FiFileText, FiBriefcase,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import AppShell from '@/components/AppShell';
import ScoreRing from '@/components/ScoreRing';
import styles from './results.module.css';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisByResumeId } from '../lib/api';

function ResultsContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lastAnalysis') : null;

  const { data: analyses, isLoading, isError, error } = useQuery({
    queryKey: ['analysis', resumeId],
    queryFn: () => getAnalysisByResumeId(resumeId),
    enabled: !stored && !!resumeId,
  });

  // Use sessionStorage result (just navigated from /analyse) or the latest from DB
  const result = stored ? JSON.parse(stored) : (Array.isArray(analyses) ? analyses[analyses.length - 1] : null);

  if (isLoading) return <p style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading results...</p>;
  if (isError) return <p style={{ color: 'var(--danger)', padding: '40px' }}>Error: {error.message}</p>;
  if (!result) return <p style={{ padding: '40px', color: 'var(--text-secondary)' }}>No analysis found. Run one first.</p>;

  const matchedSkillsArr = result.matchedSkills
    ? result.matchedSkills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const missingSkillsArr = result.missingSkills
    ? result.missingSkills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const score = result.matchScore;
  const scoreLabel = score >= 75 ? 'Excellent Match!' : score >= 50 ? 'Good Match' : 'Needs Improvement';
  const scoreColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  const analysisDate = new Date(result.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <AppShell>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={`${styles.header} animate-fadeInUp`}>
          <div>
            <div className={styles.breadcrumb}>
              <Link href="/dashboard">Overview</Link>
              <span>/</span>
              <Link href="/analyse">Analyse</Link>
              <span>/</span>
              <span>Results</span>
            </div>
            <h1 className={styles.title}>Analysis Results</h1>
            <p className={styles.date}>Generated on {analysisDate}</p>
            {/* Job + Resume context */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              {result.resumeFileName && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiFileText size={13} /> {result.resumeFileName}
                </span>
              )}
              {result.jobTitle && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiBriefcase size={13} /> {result.jobTitle}{result.companyName ? ` @ ${result.companyName}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/analyse" className="btn-primary">
              <FiPlusCircle size={16} /> New Analysis
            </Link>
            <Link href="/dashboard" className="btn-outline">
              <FiHome size={16} /> Dashboard
            </Link>
          </div>
        </div>

        {/* ── Score hero ── */}
        <div className={`${styles.scoreHero} animate-fadeInUp delay-1`}>
          <div className={styles.scoreLeft}>
            <ScoreRing score={score} size={180} />
          </div>
          <div className={styles.scoreRight}>
            <span className={styles.scoreLabel} style={{ color: scoreColor }}>{scoreLabel}</span>
            <h2 className={styles.scoreTitle}>
              Your resume matches <span style={{ color: scoreColor }}>{Math.round(score)}%</span> of the job requirements.
            </h2>
            <p className={styles.scoreDesc}>
              You matched <strong>{matchedSkillsArr.length}</strong> out of{' '}
              <strong>{matchedSkillsArr.length + missingSkillsArr.length}</strong> required skills.
              {missingSkillsArr.length > 0 && ` Add ${missingSkillsArr.length} more skill${missingSkillsArr.length > 1 ? 's' : ''} to improve your match.`}
            </p>
          </div>
        </div>

        {/* ── Skills grid ── */}
        <div className={styles.skillsGrid}>
          {/* Matched */}
          <div className={`${styles.skillsPanel} animate-fadeInUp delay-2`}>
            <div className={styles.panelHeader}>
              <span className={styles.panelIcon} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <FiCheckCircle size={16} />
              </span>
              <h3 className={styles.panelTitle}>Matched Skills</h3>
              <span className="badge badge-success">{matchedSkillsArr.length}</span>
            </div>
            <p className={styles.panelDesc}>These skills from your resume align with the job requirements.</p>
            <div className={styles.skillBadges}>
              {matchedSkillsArr.map(skill => (
                <span key={skill} className={`badge badge-success ${styles.skillBadge}`}>{skill}</span>
              ))}
              {matchedSkillsArr.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matched skills found.</p>
              )}
            </div>
          </div>

          {/* Missing */}
          <div className={`${styles.skillsPanel} animate-fadeInUp delay-3`}>
            <div className={styles.panelHeader}>
              <span className={styles.panelIcon} style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <FiXCircle size={16} />
              </span>
              <h3 className={styles.panelTitle}>Missing Skills</h3>
              <span className="badge badge-danger">{missingSkillsArr.length}</span>
            </div>
            <p className={styles.panelDesc}>Add these skills to your resume to better match this role.</p>
            <div className={styles.skillBadges}>
              {missingSkillsArr.map(skill => (
                <span key={skill} className={`badge badge-danger ${styles.skillBadge}`}>{skill}</span>
              ))}
              {missingSkillsArr.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>No missing skills!</p>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Suggestions ── */}
        <div className={`${styles.suggestionsCard} animate-fadeInUp delay-4`}>
          <div className={styles.suggestionsHeader}>
            <HiSparkles size={20} color="var(--accent-purple-light)" />
            <h3 className={styles.panelTitle}>AI Suggestions</h3>
          </div>
          <p className={styles.suggestionsText}>{result.suggestions}</p>
        </div>

        {/* ── Action bar ── */}
        <div className={`${styles.actionBar} animate-fadeInUp delay-5`}>
          <Link href="/analyse" className="btn-primary" style={{ padding: '12px 32px' }}>
            <FiPlusCircle size={16} /> Run Another Analysis
          </Link>
          <Link href="/dashboard" className="btn-outline" style={{ padding: '12px 32px' }}>
            <FiArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
