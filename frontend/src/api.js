const API_URL = "http://localhost:5000/api";

const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!isMultipart) headers["Content-Type"] = "application/json";
    return headers;
};

// --- 🔐 AUTHENTICATION ---
export const login = (email, password) =>
    fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    }).then(res => res.json());

export const register = (email, password) =>
    fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    }).then(res => res.json());

export const verifyOtp = (email, code, password) =>
    fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password })
    }).then(res => res.json());

// --- ✈️ RADAR & LISTINGS ---
export const fetchListings = () =>
    fetch(`${API_URL}/listings`, { headers: getHeaders() }).then(res => res.json());

export const getListingById = (id) =>
    fetch(`${API_URL}/listings/${id}`, { headers: getHeaders() }).then(res => {
        if (!res.ok) throw new Error("VESSEL_NOT_FOUND");
        return res.json();
    });

// --- 👤 PERSONNEL & PROFILE ---
export const getProfile = () =>
    fetch(`${API_URL}/users/me`, { headers: getHeaders() }).then(res => {
        if (!res.ok) throw new Error("UNAUTHORIZED");
        return res.json();
    });

export const updateProfile = (profileData) =>
    fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(profileData)
    }).then(res => res.json());

export const uploadPhoto = (formData) =>
    fetch(`${API_URL}/users/profile/photo`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData
    }).then(res => res.json());

// --- 💬 COMMS ---
export const getChatHistory = (listingId) =>
    fetch(`${API_URL}/chat/${listingId}`, { headers: getHeaders() }).then(res => {
        if (!res.ok) return [];
        return res.json();
    });

// ==========================================
// 📦 THE "BRIDGE" EXPORTS (Fixes SyntaxErrors)
// ==========================================
const apiBundle = {
    login,
    register,
    verifyOtp,
    fetchListings,
    getListingById,
    getProfile,
    updateProfile,
    uploadPhoto,
    getChatHistory
};

// Satisfies 'import { api } from ...'
export const api = apiBundle;

// Satisfies 'import api from ...'
export default apiBundle;