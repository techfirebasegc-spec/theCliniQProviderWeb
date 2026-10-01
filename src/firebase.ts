"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const configuration = { apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID };

function app(): FirebaseApp { if (Object.values(configuration).some((value) => !value || value.startsWith("your_"))) throw new Error("Firebase web configuration is incomplete. Set NEXT_PUBLIC_FIREBASE_* values in .env.local."); return getApps().length ? getApp() : initializeApp(configuration); }
export function firebaseAuth(): Auth { return getAuth(app()); }
