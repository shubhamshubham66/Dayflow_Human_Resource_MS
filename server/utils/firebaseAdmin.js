const admin = require('firebase-admin');

/**
 * Firebase Admin — used only to verify phone-auth ID tokens sent by the client.
 * Verifying ID tokens needs just the project ID (Google's public keys are
 * fetched automatically), so no service-account key is required.
 */
const getFirebaseApp = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is not set in server .env');
    }
    admin.initializeApp({ projectId });
  }
  return admin.app();
};

/**
 * Verify a Firebase ID token and return the verified phone number (E.164, e.g. +919876543210).
 * Throws if the token is invalid, expired, or has no phone number.
 */
const verifyPhoneToken = async (idToken) => {
  const decoded = await getFirebaseApp().auth().verifyIdToken(idToken);
  if (!decoded.phone_number) {
    throw new Error('Token does not contain a verified phone number');
  }
  return decoded.phone_number;
};

module.exports = { verifyPhoneToken };
