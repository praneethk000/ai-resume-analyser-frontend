'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiClock, FiChevronRight, FiFileText,
  FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import AppShell from '@/components/AppShell';
import ScoreRing from '@/components/ScoreRing';
import styles from './history.module.css';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAllAnalysesByUser } from '@/app/lib/api';

function scoreColor(score) {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function scoreLabel(score) {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  return 'Weak Match';
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  // Auth guard: redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analyses', user?.userId],
    queryFn: () => getAllAnalysesByUser(user.userId),
    enabled: !!user?.userId,
  });

  // Show spinner while auth state rehydrates
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const history = Array.isArray(data) ? data : [];

  function handleSelect(item) {
    sessionStorage.setItem('lastAnalysis', JSON.stringify(item));
    setSelected(item);
  }


  return (
    <AppShell>
      <div className={styles.container}>

        {/* ── Left: History List ── */}
        <div className={styles.listPanel}>
          <div className={styles.listHeader}>
            <FiClock size={18} />
            <h2 className={styles.listTitle}>Analysis History</h2>
            <span className={styles.badge}>{history.length}</span>
          </div>

          {isLoading ? (
            <div className={styles.empty}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
              <p>Loading history...</p>
            </div>
          ) : isError ? (
            <div className={styles.empty}>
              <FiClock size={32} opacity={0.3} />
              <p style={{ color: 'var(--danger)' }}>Failed to load history.</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Make sure the backend is running.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className={styles.empty}>
              <FiClock size={32} opacity={0.3} />
              <p>No analyses yet</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Run your first analysis to see results here.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {history.map((item) => (
                <li
                  key={item.resumeAnalysisId}
                  className={`${styles.listItem} ${selected?.resumeAnalysisId === item.resumeAnalysisId ? styles.listItemActive : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className={styles.listItemLeft}>
                    <div className={styles.listScore} style={{ color: scoreColor(item.matchScore) }}>
                      {Math.round(item.matchScore)}%
                    </div>
                    <div className={styles.listMeta}>
                      <p className={styles.listJob}>
                        {[item.jobTitle, item.companyName].filter(Boolean).join(' @ ') || 'Unknown Job'}
                      </p>
                      <p className={styles.listResume}>
                        <FiFileText size={11} /> {item.resumeFileName || 'Unknown Resume'}
                      </p>
                      <p className={styles.listDate}>{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <FiChevronRight size={16} className={styles.chevron} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className={styles.detailPanel}>
          {!selected ? (
            <div className={styles.detailEmpty}>
              <FiClock size={48} opacity={0.15} />
              <h3>Select an analysis</h3>
              <p>Click any item from the list to view its full results.</p>
            </div>
          ) : (
            <div className={`${styles.detailContent} animate-fadeInUp`}>

              {/* Header */}
              <div className={styles.detailHeader}>
                <div>
                  <p className={styles.detailCompany}>{selected.companyName}</p>
                  <h2 className={styles.detailJob}>{selected.jobTitle}</h2>
                  <p className={styles.detailDate}>Analysed on {formatDate(selected.createdAt)}</p>
                </div>
                <div
                  className={styles.detailScoreBadge}
                  style={{ color: scoreColor(selected.matchScore), borderColor: scoreColor(selected.matchScore) }}
                >
                  {scoreLabel(selected.matchScore)}
                </div>
              </div>

              {/* Score Ring + summary */}
              <div className={styles.scoreRow}>
                <ScoreRing score={selected.matchScore} size={140} />
                <div className={styles.scoreSummary}>
                  <p className={styles.scoreTitle} style={{ color: scoreColor(selected.matchScore) }}>
                    {Math.round(selected.matchScore)}% Match
                  </p>
                  <p className={styles.scoreDesc}>
                    Matched {selected.matchedSkills?.split(',').filter(Boolean).length || 0} out of{' '}
                    {(selected.matchedSkills?.split(',').filter(Boolean).length || 0) + (selected.missingSkills?.split(',').filter(Boolean).length || 0)} required skills.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Resume: {selected.resumeFileName || 'Unknown Resume'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className={styles.skillsGrid}>
                <div className={styles.skillBox}>
                  <div className={styles.skillBoxHeader}>
                    <FiCheckCircle size={14} color="var(--success)" />
                    <span>Matched Skills</span>
                    <span className="badge badge-success">{selected.matchedSkills?.split(',').filter(Boolean).length || 0}</span>
                  </div>
                  <div className={styles.skillTags}>
                    {selected.matchedSkills?.split(',').filter(Boolean).map(s => (
                      <span key={s.trim()} className="badge badge-success">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillBox}>
                  <div className={styles.skillBoxHeader}>
                    <FiXCircle size={14} color="var(--danger)" />
                    <span>Missing Skills</span>
                    <span className="badge badge-danger">
                      {selected.missingSkills ? selected.missingSkills.split(',').filter(Boolean).length : 0}
                    </span>
                  </div>
                  <div className={styles.skillTags}>
                    {selected.missingSkills && selected.missingSkills.split(',').filter(Boolean).length > 0 ? (
                      selected.missingSkills.split(',').filter(Boolean).map(s => (
                        <span key={s.trim()} className="badge badge-danger">{s.trim()}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>No missing skills!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className={styles.suggestions}>
                <div className={styles.suggestionsHeader}>
                  <HiSparkles size={16} color="var(--accent-purple-light)" />
                  <span>AI Suggestions</span>
                </div>
                <p className={styles.suggestionsText}>{selected.suggestions}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
