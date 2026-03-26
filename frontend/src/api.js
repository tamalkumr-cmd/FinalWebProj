const API_URL = "http://localhost:5000/api";

/**
 * 🛰️ HEADER GENERATOR
 * Optimized for NORS_OS v4. Handles standard JSON and Multipart-FormData.
 */
const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // CRITICAL: For FormData/Multipart, let the browser set the boundary automatically.
    if (!isMultipart) headers["Content-Type"] = "application/json";

    return headers;
};

// ==========================================
// 🔐 AUTHENTICATION (IDENTITY VERIFICATION)
// ==========================================

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

export const verifyOtp = (email, code) =>
    fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
    }).then(res => res.json());

// ==========================================
// ✈️ RADAR & LISTINGS (FLIGHT OPERATIONS)
// ==========================================

export const fetchListings = () =>
    fetch(`${API_URL}/listings`, { headers: getHeaders() }).then(res => res.json());

export const getListingById = (id) =>
    fetch(`${API_URL}/listings/${id}`, { headers: getHeaders() }).then(res => {
        if (!res.ok) throw new Error("VESSEL_NOT_FOUND");
        return res.json();
    });

/**
 * 🚀 INITIATE_FLEET_DEPLOYMENT
 * Fixed: This was missing and caused the "not a function" error.
 */
export const createListing = (formData) =>
    fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: getHeaders(true), // Set to true because we're sending FormData (images)
        body: formData
    }).then(res => {
        if (!res.ok) throw new Error("DEPLOYMENT_REJECTED");
        return res.json();
    });

// ==========================================
// 👤 PERSONNEL & PROFILE (BIOMETRICS)
// ==========================================

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

export const searchPersonnel = (query) =>
    fetch(`${API_URL}/users/search?query=${query}`, {
        headers: getHeaders()
    }).then(res => res.json());

// ==========================================
// 💬 COMMS TACTICAL SUITE (UPGRADED)
// ==========================================

export const getInbox = () =>
    fetch(`${API_URL}/chat/inbox`, { headers: getHeaders() }).then(res => res.json());

export const getChatHistory = (partnerId) =>
    fetch(`${API_URL}/chat/history/${partnerId}`, { headers: getHeaders() }).then(res => res.json());

export const sendMessage = (packet) =>
    fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(packet)
    }).then(res => res.json());

export const uploadChatImage = (formData) =>
    fetch(`${API_URL}/chat/upload`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData
    }).then(res => res.json());

export const deleteMessage = (messageId) =>
    fetch(`${API_URL}/chat/message/${messageId}`, {
        method: "DELETE",
        headers: getHeaders()
    }).then(res => res.json());

export const getListingMessages = (listingId) =>
    fetch(`${API_URL}/chat/listing/${listingId}`, { headers: getHeaders() }).then(res => {
        if (!res.ok) return [];
        return res.json();
    });

// ==========================================
// 📦 THE "BRIDGE" EXPORTS
// ==========================================
const apiBundle = {
    login,
    register,
    verifyOtp,
    fetchListings,
    getListingById,
    createListing, // 👈 Added to the bridge
    getProfile,
    updateProfile,
    uploadPhoto,
    searchPersonnel,
    getInbox,
    getChatHistory,
    sendMessage,
    uploadChatImage,
    deleteMessage,
    getListingMessages
};

export const api = apiBundle;
export default apiBundle;