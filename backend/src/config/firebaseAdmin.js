import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ESM
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Path to serviceAccountKey.json (in backend root)
const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");

// Read and parse JSON manually
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;