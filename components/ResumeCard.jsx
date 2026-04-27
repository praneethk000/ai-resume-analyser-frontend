import Link from 'next/link';
import styles from './ResumeCard.module.css';

export default function ResumeCard({ resume, onAnalyse }) {
  const { resumeId, title, firstName, lastName, resumeFileName, skills = [], resumeUploadedAt } = resume;

  const displayName = firstName && lastName ? `${firstName} ${lastName}` : 'Unnamed Profile';
  const uploadDate = resumeUploadedAt
    ? new Date(resumeUploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className={styles.meta}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.name}>{displayName}</p>
        </div>
      </div>

      {resumeFileName && (
        <div className={styles.fileInfo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>{resumeFileName}</span>
        </div>
      )}

      <div className={styles.skills}>
        {skills.slice(0, 5).map((skill) => (
          <span key={skill} className="badge badge-purple">{skill}</span>
        ))}
        {skills.length > 5 && (
          <span className={styles.moreSkills}>+{skills.length - 5} more</span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>Uploaded {uploadDate}</span>
        <div className={styles.actions}>
          <Link href={`/results?resumeId=${resumeId}`} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            History
          </Link>
          <button onClick={() => onAnalyse(resumeId)} className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
            Analyse ✦
          </button>
        </div>
      </div>
    </div>
  );
}
