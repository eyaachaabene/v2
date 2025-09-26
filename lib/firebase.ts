import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyB-_E6vGqmA65BMR-93XoHmZpt8Wzy8RlM",
  authDomain: "agriconnect-d135b.firebaseapp.com",
  projectId: "agriconnect-d135b",
  storageBucket: "agriconnect-d135b.firebasestorage.app",
  messagingSenderId: "147668971587",
  appId: "1:147668971587:web:agriconnect-web-app",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

if (typeof window !== "undefined") {
  // Only run in browser environment
  console.log("[v0] Firebase initialized with project:", firebaseConfig.projectId)
}

export default app
