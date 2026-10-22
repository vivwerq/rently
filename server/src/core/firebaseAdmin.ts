import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env from server directory or workspace root
dotenv.config();
const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

let app: App | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let isConfigured = false;

function initFirebaseAdmin() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    isConfigured = true;
    firestore = getFirestore(app);
    auth = getAuth(app);
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  try {
    if (serviceAccountJson && serviceAccountJson.trim().length > 10) {
      const parsed = JSON.parse(serviceAccountJson);
      app = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId
      });
      isConfigured = true;
    } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      app = initializeApp({
        credential: cert(serviceAccountPath),
        projectId
      });
      isConfigured = true;
    } else if (projectId && projectId !== 'rently-hyperlocal' && projectId.length > 3) {
      app = initializeApp({
        projectId
      });
      isConfigured = true;
    }

    if (isConfigured && app) {
      firestore = getFirestore(app);
      auth = getAuth(app);
      console.info(`[Firebase Admin] Successfully initialized for project: ${projectId || 'default'}`);
    } else {
      console.info('[Firebase Admin] No service account credentials found. Server running in hybrid mode with local memory fallback.');
    }
  } catch (err) {
    console.warn('[Firebase Admin] Initialization warning (operating with local fallback):', err);
    isConfigured = false;
  }
}

initFirebaseAdmin();

export const isFirebaseAdminConfigured = (): boolean => isConfigured;
export const getAdminDb = (): Firestore | null => firestore;
export const getAdminAuth = (): Auth | null => auth;
