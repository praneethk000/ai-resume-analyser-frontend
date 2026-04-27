import api from "./axios";
import axios from "axios";

const BASE_URL = 'http://localhost:8080';

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

// Sends resume file and userId to backend, returns object with extracted resumeId and skills
export async function uploadResume(file, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    // Let Axios automatically set the Content-Type to multipart/form-data with the correct boundary
    const res = await api.post('/web/api/resume/v1/uploadResume', formData);
    return res.data; // { resumeId, extractedSkills: string[] }
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
