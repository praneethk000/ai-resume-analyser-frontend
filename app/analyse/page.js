'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  FiUploadCloud, FiCheckCircle, FiFile,
  FiArrowLeft, FiArrowRight, FiZap,
  FiBriefcase, FiCpu,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import StepIndicator from '@/components/StepIndicator';
import styles from './analyse.module.css';
import { useMutation } from '@tanstack/react-query';
import { analyseResume, createJobDescription, uploadResume, extractSkillsOnly } from '../lib/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────

function AnalyseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1 state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedResumeId, setUploadedResumeId] = useState(preselectedResumeId || null);
  const [extractedSkills, setExtractedSkills] = useState([]);

  // Step 2 state
  const [jobForm, setJobForm] = useState({ jobTitle: '', companyName: '', jobDescriptionText: '' });
  const [createdJobId, setCreatedJobId] = useState(null);

  // Re-hydrate pending job description if returned from registration
  useEffect(() => {
    const pendingJob = sessionStorage.getItem('pendingJobDescription');
    if (pendingJob && user) {
      setJobForm(JSON.parse(pendingJob));
      setStep(1); // They need to re-upload the file
    }
  }, [user]);

  const uploadMutation = useMutation({
    mutationFn: ({ file }) => uploadResume(file, user?.userId),
    onSuccess: (data) => {
      setUploadedResumeId(data.resumeId);
      setExtractedSkills(data.extractedSkills || []);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Upload failed');
      setLoading(false);
    }
  });

  const extractMutation = useMutation({
    mutationFn: extractSkillsOnly,
    onSuccess: (skills) => {
      setUploadedResumeId('guest-resume');
      setExtractedSkills(skills || []);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Extraction failed');
      setLoading(false);
    }
  });

  const jobMutation = useMutation({
    mutationFn: createJobDescription,
    onSuccess: (data) => {
      setCreatedJobId(data.jobId);
      setStep(3);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to save job description');
      setLoading(false);
    },
  });

  const analysisMutation = useMutation({
    mutationFn: ({ resumeId, jobId }) => analyseResume(resumeId, jobId),
    onSuccess: (data) => {
      sessionStorage.setItem('lastAnalysis', JSON.stringify(data));
      sessionStorage.removeItem('pendingJobDescription');
      setLoading(false);
      router.push('/results');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Analysis failed');
      setLoading(false);
    },
  });

  // ── Step 1: Handle file upload ──────────────────────────────────────────────
  function handleFileDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') handleFile(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  function handleFile(file) {
    setUploadedFile(file);
    if (!user) {
      setLoading(true);
      extractMutation.mutate(file);
      return;
    }
    setLoading(true);
    uploadMutation.mutate({ file });
  }

  function goToStep2() {
    if (uploadedResumeId) setStep(2);
  }

  // ── Step 2: Submit job description ─────────────────────────────────────────
  function handleJobSubmit(e) {
    e.preventDefault();
    if (!user) {
      setLoading(true);
      setTimeout(() => {
        setCreatedJobId('guest-job');
        setStep(3);
        setLoading(false);
      }, 600);
      return;
    }
    setLoading(true);
    jobMutation.mutate(jobForm);
  }

  // ── Step 3: Run analysis ────────────────────────────────────────────────────
  function handleRunAnalysis() {
    if (!user) {
      sessionStorage.setItem('pendingJobDescription', JSON.stringify(jobForm));
      router.push('/register?marketing=true');
      return;
    }
    setLoading(true);
    analysisMutation.mutate({ resumeId: uploadedResumeId, jobId: createdJobId });
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <StepIndicator currentStep={step} />

        {/* ── STEP 1: Upload Resume ── */}
        {step === 1 && (
          <div className={`${styles.stepCard} animate-scaleIn`}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Upload Your Resume</h2>
              <p className={styles.stepDesc}>Upload a PDF resume and our AI will automatically extract your skills.</p>
            </div>

            {!uploadedFile || (!uploadedResumeId && !loading) ? (
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                <div className={styles.dropIconWrap}>
                  <FiUploadCloud size={36} />
                </div>
                <p className={styles.dropTitle}>Drag &amp; drop your PDF here</p>
                <p className={styles.dropSub}>or click to browse files</p>
                <span className={styles.dropBadge}>PDF only · Max 10MB</span>
              </div>
            ) : loading ? (
              <div className={styles.uploadLoading}>
                <div className="spinner" style={{ width: 36, height: 36 }} />
                <p>Extracting skills with AI...</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This may take a few seconds</p>
              </div>
            ) : (
              <div className={styles.uploadSuccess}>
                <div className={styles.fileBox}>
                  <FiCheckCircle size={22} color="var(--success)" />
                  <div>
                    <p className={styles.fileName}>{uploadedFile?.name || 'Resume uploaded'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Uploaded successfully</p>
                  </div>
                </div>
                <div className={styles.skillsExtracted}>
                  <p className={styles.skillsLabel}>
                    <HiSparkles size={14} /> AI Extracted Skills ({extractedSkills.length})
                  </p>
                  <div className={styles.skillsWrap}>
                    {extractedSkills.map(s => (
                      <span key={s} className="badge badge-purple">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {preselectedResumeId && !uploadedFile && (
              <div className={styles.preselected}>
                <FiCheckCircle size={15} /> Using pre-selected resume from dashboard
              </div>
            )}

            <div className={styles.stepFooter}>
              <button className="btn-outline" onClick={() => router.push('/dashboard')}>
                <FiArrowLeft size={16} /> Back
              </button>
              <button
                className="btn-primary"
                onClick={goToStep2}
                disabled={!uploadedResumeId && !preselectedResumeId}
              >
                Continue <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Job Description ── */}
        {step === 2 && (
          <div className={`${styles.stepCard} animate-scaleIn`}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Add Job Description</h2>
              <p className={styles.stepDesc}>Paste the job listing you want to match against. We&apos;ll extract the required skills using AI.</p>
            </div>

            <form onSubmit={handleJobSubmit} className={styles.jobForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="jobTitle">Job Title *</label>
                  <input
                    id="jobTitle"
                    className="form-input"
                    placeholder="e.g. Senior Software Engineer"
                    value={jobForm.jobTitle}
                    onChange={e => setJobForm(p => ({ ...p, jobTitle: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">Company Name *</label>
                  <input
                    id="companyName"
                    className="form-input"
                    placeholder="e.g. Google"
                    value={jobForm.companyName}
                    onChange={e => setJobForm(p => ({ ...p, companyName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="jobDescriptionText">Job Description *</label>
                <textarea
                  id="jobDescriptionText"
                  className="form-textarea"
                  placeholder="Paste the full job description here. Include required skills, responsibilities, and qualifications..."
                  value={jobForm.jobDescriptionText}
                  onChange={e => setJobForm(p => ({ ...p, jobDescriptionText: e.target.value }))}
                  required
                  rows={8}
                />
              </div>

              <div className={styles.stepFooter}>
                <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                  <FiArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Saving...</> : <>Continue <FiArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Run Analysis ── */}
        {step === 3 && (
          <div className={`${styles.stepCard} animate-scaleIn`}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Ready to Analyse</h2>
              <p className={styles.stepDesc}>Everything is set. Click the button below to run the AI-powered analysis.</p>
            </div>

            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <div className={styles.confirmItem}>
                  <div className={styles.confirmIconWrap}>
                    <FiFile size={20} />
                  </div>
                  <div>
                    <p className={styles.confirmLabel}>Resume</p>
                    <p className={styles.confirmValue}>{uploadedFile?.name || 'Pre-selected resume'}</p>
                  </div>
                </div>
                <div className={styles.confirmDivider} />
                <div className={styles.confirmItem}>
                  <div className={styles.confirmIconWrap}>
                    <FiBriefcase size={20} />
                  </div>
                  <div>
                    <p className={styles.confirmLabel}>Job</p>
                    <p className={styles.confirmValue}>{jobForm.jobTitle || 'Software Engineer'} @ {jobForm.companyName || 'Company'}</p>
                  </div>
                </div>
              </div>
              <div className={styles.confirmHint}>
                <HiSparkles size={16} color="var(--accent-purple-light)" />
                <span>Our AI will compare your skills against the job requirements and generate a detailed report.</span>
              </div>
            </div>

            {loading ? (
              <div className={styles.uploadLoading}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
                <p style={{ fontWeight: 600 }}>AI is analysing your resume...</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Comparing skills, calculating match score...</p>
              </div>
            ) : (
              <div className={styles.stepFooter}>
                <button className="btn-outline" onClick={() => setStep(2)}>
                  <FiArrowLeft size={16} /> Back
                </button>
                <button className="btn-primary" onClick={handleRunAnalysis} style={{ padding: '13px 36px' }}>
                  <FiCpu size={16} /> Run Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <AnalyseContent />
    </Suspense>
  );
}
