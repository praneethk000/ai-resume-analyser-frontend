'use client';

import Link from 'next/link';
import {
  FiFileText, FiCpu, FiBarChart2,
  FiArrowRight, FiCheckCircle, FiAlertCircle,
  FiUpload,
} from 'react-icons/fi';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

const features = [
  {
    Icon: FiUpload,
    title: 'Upload Any PDF Resume',
    desc: 'Simply drag and drop your PDF resume. Our backend uses Apache PDFBox to extract and parse every word accurately.',
  },
  {
    Icon: FiCpu,
    title: 'AI Skill Extraction',
    desc: 'GPT-4o reads both your resume and the job description, intelligently extracting and matching technical and soft skills.',
  },
  {
    Icon: FiBarChart2,
    title: 'Precision Match Score',
    desc: 'Get a percentage match score, a list of matched skills, the skills you\'re missing, and personalized improvement suggestions.',
  },
];

const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up in seconds. No credit card required.' },
  { num: '02', title: 'Upload Your Resume', desc: 'Upload your PDF and let our AI extract your skills automatically.' },
  { num: '03', title: 'Paste the Job Description', desc: 'Paste any job listing from LinkedIn, Indeed, or any other platform.' },
  { num: '04', title: 'Get Your Analysis', desc: 'Instantly see your match score, skill gaps, and AI-powered suggestions.' },
];

function LandingContent() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <Navbar />

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroContent}>
            <div className={`${styles.pill} animate-fadeInUp`}>
              ✦ Powered by GPT-4o &amp; Spring Boot
            </div>
            <h1 className={`${styles.heroTitle} animate-fadeInUp delay-1`}>
              Land Your Dream Job<br />
              <span className="gradient-text">with AI Precision</span>
            </h1>
            <p className={`${styles.heroDesc} animate-fadeInUp delay-2`}>
              Upload your resume. Paste a job description. Get an instant AI-powered match score,
              skill gap analysis, and personalised suggestions — in seconds.
            </p>
            <div className={`${styles.heroCtas} animate-fadeInUp delay-3`}>
              {user ? (
                <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                  Go to Dashboard <FiArrowRight />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                    Start Analysing Free <FiArrowRight />
                  </Link>
                  <Link href="/login" className="btn-outline" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className={`${styles.heroNote} animate-fadeInUp delay-4`}>
              No credit card &nbsp;·&nbsp; Free to use &nbsp;·&nbsp; Results in seconds
            </p>
          </div>

          {/* Floating score preview */}
          <div className={`${styles.heroPreview} animate-fadeInUp delay-4`}>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div className={styles.previewDot} style={{ background: '#ef4444' }} />
                <div className={styles.previewDot} style={{ background: '#f59e0b' }} />
                <div className={styles.previewDot} style={{ background: '#22c55e' }} />
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analysis Result</span>
              </div>
              <div className={styles.previewScore}>
                <div className={styles.previewScoreNum}>78%</div>
                <div className={styles.previewScoreLabel}>Match Score</div>
              </div>
              <div className={styles.previewSkills}>
                <div className={styles.previewRow}>
                  <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}>✓ Matched</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['React', 'Java', 'Spring Boot', 'PostgreSQL'].map(s => (
                      <span key={s} className="badge badge-success">{s}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.previewRow}>
                  <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>✗ Missing</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['Kubernetes', 'Redis'].map(s => (
                      <span key={s} className="badge badge-danger">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionLabel}>What We Offer</div>
            <h2 className={styles.sectionTitle}>Everything you need to stand out</h2>
            <div className={styles.featureGrid}>
              {features.map((f, i) => (
                <div key={f.title} className={`${styles.featureCard} animate-fadeInUp delay-${i + 1}`}>
                  <div className={styles.featureIcon}><f.Icon size={26} /></div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className={styles.section} style={{ background: 'rgba(124,58,237,0.03)' }}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionLabel}>How It Works</div>
            <h2 className={styles.sectionTitle}>From upload to insights in 4 steps</h2>
            <div className={styles.stepsGrid}>
              {steps.map((step, i) => (
                <div key={step.num} className={`${styles.stepCard} animate-fadeInUp delay-${i + 1}`}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Ready to optimise your resume?</h2>
            <p className={styles.ctaDesc}>Join thousands of job seekers using AI to get hired faster.</p>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}>
                Go to Dashboard →
              </Link>
            ) : (
              <Link href="/register" className="btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}>
                Get Started — It&apos;s Free →
              </Link>
            )}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span className={styles.footerLogo}>◆ ResumeAI</span>
            <p className={styles.footerText}>Built with Spring Boot, Next.js, and GPT-4o.</p>
            <p className={styles.footerCopy}>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </footer>
      </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
