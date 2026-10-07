import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase — used only for mobile number (SMS OTP) verification.
 * Web config values are public identifiers, not secrets; they can be
 * overridden with VITE_FIREBASE_* variables in client/.env.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBPpBBvPeYtV4sQX5j_7EECABF1_7VatqQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'day-flow-9d3b1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'day-flow-9d3b1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'day-flow-9d3b1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '431802359495',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:431802359495:web:0112272a1a844ddabd68e2',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Note: don't call auth.useDeviceLanguage() — browser locales longer than 6 chars
// (e.g. "zh-Hant-TW", "en-US@posix") make Firebase phone auth fail with auth/argument-error.
