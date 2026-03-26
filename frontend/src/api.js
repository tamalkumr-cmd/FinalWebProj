const API_URL = "http://localhost:5000/api";

/**
 * 🛰️ HEADER GENERATOR
 * Handles standard JSON transmissions and Multipart (File) uploads.
 */
const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
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

// 📥 SCAN_INBOX: Get all active personnel frequencies
export const getInbox = () =>
    fetch(`${API_URL}/chat/inbox`, { headers: getHeaders() }).then(res => res.json());

// 📂 DECRYPT_HISTORY: Get 1:1 message history with specific personnel
export const getChatHistory = (partnerId) =>
    fetch(`${API_URL}/chat/history/${partnerId}`, { headers: getHeaders() }).then(res => res.json());

// ⚡ INITIATE_TRANSMISSION: Save a new packet (Supports Text + Images)
export const sendMessage = (packet) =>
    fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(packet)
    }).then(res => res.json());

// 🖼️ UPLOAD_CHAT_MEDIA: Upload images specifically for chat attachments
export const uploadChatImage = (formData) =>
    fetch(`${API_URL}/chat/upload`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData
    }).then(res => res.json());

// 🗑️ SCRUB_MESSAGE: Delete/Unsend a transmission from the database
export const deleteMessage = (messageId) =>
    fetch(`${API_URL}/chat/message/${messageId}`, {
        method: "DELETE",
        headers: getHeaders()
    }).then(res => res.json());

// 📑 SECTOR_LOGS: Get messages for a specific listing/flight sector
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