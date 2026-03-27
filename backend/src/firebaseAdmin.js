import admin from "firebase-admin";

const initializeFirebase = () => {
    try {
        // 🛰️ TACTICAL SHIFT: Read from Environment Variable instead of File
        const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!serviceAccountVar) {
            console.error("⚠️ [FIREBASE]: FIREBASE_SERVICE_ACCOUNT not found in Environment Variables.");
            return;
        }

        const serviceAccount = JSON.parse(serviceAccountVar);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log("🚀 [FIREBASE]: Identity Verified. Tactical Link Established.");
    } catch (error) {
        console.error("❌ [FIREBASE_CRASH]: Failed to initialize admin SDK:", error.message);
    }
};

initializeFirebase();

export default admin;