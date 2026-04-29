import api from "./axios";
import axios from "axios";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') return `http://${window.location.hostname}:8080`;
    return 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();

// ── AUTH (no token needed yet, use plain axios) ───────────────────────────────

export async function registerUser({ username, email, password }) {
    const res = await axios.post(`${BASE_URL}/web/api/auth/v1/registerUser`, {
        username, email, password,
    });
    return res.data; // { token, userId, username }
}

export async function loginUser({ email, password }) {
    const res = await axios.post(`${BASE_URL}/web/api/auth/v1/loginUser`, {
        email, password,
    });
    return res.data; // { token, userId, username }
}

// ── RESUME ────────────────────────────────────────────────────────────────────

// NOTE: userId param removed — backend now derives the user from the JWT (IDOR fix).
// The @AuthenticationPrincipal on the backend always uses the authenticated user's ID.
export async function uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    // Let Axios set the Content-Type automatically so it includes the boundary
    const res = await api.post('/web/api/resume/v1/uploadResume', formData);
    return res.data; // { resumeId, extractedSkills: string[] }
}

export async function extractSkillsOnly(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/web/api/resume/v1/extractSkillsOnly', formData);
    return res.data; // string[]
}

// FIX: was named getResumeByUserId — unified to getResumesByUser everywhere
export async function getResumesByUser(userId) {
    const res = await api.get(`/web/api/resume/v1/displayResumeByUser?userId=${userId}`);
    return res.data; // ResumeResponseDto[] (with skills array of strings)
}

// ── JOB DESCRIPTION ───────────────────────────────────────────────────────────

export async function createJobDescription({ jobTitle, companyName, jobDescriptionText }) {
    // FIX: was '/web/api/createJobDescription' (wrong path)
    const res = await api.post('/web/api/jobDescription/v1/createJobDescription', {
        jobTitle, companyName, jobDescriptionText,
    });
    return res.data; // { jobId, jobTitle, companyName, jobDescriptionText, createdAt }
}

// ── RESUME ANALYSIS ───────────────────────────────────────────────────────────

export async function analyseResume(resumeId, jobId) {
    const res = await api.post(
        `/web/api/resumeAnalysis/v1/analyseResume?resumeId=${resumeId}&jobId=${jobId}`
    );
    return res.data; // { resumeAnalysisId, matchScore, matchedSkills, missingSkills, suggestions, createdAt }
}

export async function getAnalysisByResumeId(resumeId) {
    const res = await api.get(
        `/web/api/resumeAnalysis/v1/displayAllAnalysisByResume?resumeId=${resumeId}`
    );
    return res.data; // ResumeAnalysisResponseDto[]
}

// Returns ALL analyses for every resume owned by the user
// Endpoint: GET /web/api/resumeAnalysis/v1/displayAllAnalysisByUser?userId=...
export async function getAllAnalysesByUser(userId) {
    const res = await api.get(
        `/web/api/resumeAnalysis/v1/displayAllAnalysisByUser?userId=${userId}`
    );
    return res.data; // ResumeAnalysisResponseDto[]
}
