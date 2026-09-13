require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, cert, initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(__dirname, "../firebase-service-account.json");
const hasServiceAccountFile = fs.existsSync(serviceAccountPath);
const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

if (!hasServiceAccountFile && !hasApplicationCredentials) {
    throw new Error(
        `Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_PATH to a service-account JSON file or GOOGLE_APPLICATION_CREDENTIALS before starting the backend.`
    );
}

initializeApp({
    credential: hasServiceAccountFile ? cert(require(serviceAccountPath)) : applicationDefault()
});

const messaging = getMessaging();

module.exports = { messaging };