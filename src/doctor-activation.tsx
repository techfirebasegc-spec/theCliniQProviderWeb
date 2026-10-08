"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { activateClinicCreatedDoctor, activationMessage } from "./clinic-created-doctor-activation";
import { api } from "./provider-app";
import { authEmailCooldownActive, nextAuthEmailCooldown } from "./auth-email-cooldown";

function firebaseMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(code)) return "The email address or password is incorrect. Use Provider sign-in if you need to reset an existing Firebase password.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
  return "Firebase sign-in could not be completed.";
}

export function DoctorActivation(){
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState<string>();
  const [notice,setNotice] = useState<string>();
  const [busy,setBusy] = useState(false);
  const [verificationCooldownUntil,setVerificationCooldownUntil] = useState(0);

  function beginVerificationCooldown() { setVerificationCooldownUntil(nextAuthEmailCooldown()); window.setTimeout(() => setVerificationCooldownUntil(0), 60_000); }
  async function resendVerification() {
    if (busy || authEmailCooldownActive(verificationCooldownUntil)) return;
    setBusy(true); setError(undefined); setNotice(undefined);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      if (credential.user.emailVerified) { setNotice("This Firebase email address is already verified."); return; }
      await sendEmailVerification(credential.user);
      beginVerificationCooldown();
      setNotice("A Firebase verification email has been requested. Check your email, then return here to activate access.");
    } catch (cause) { setError(firebaseMessage(cause)); } finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError(undefined); setNotice(undefined); setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth(),email.trim(),password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        beginVerificationCooldown();
        setError("Verify your Firebase email address using the verification email we sent, then return here to activate Doctor Portal access.");
        return;
      }
      const result = await activateClinicCreatedDoctor(credential.user,api);
      if (result !== "ACTIVATED") { setError(activationMessage(result)); return; }
      setNotice(activationMessage(result));
      router.push("/doctor/profile");
    } catch (cause) {
      setError(firebaseMessage(cause));
    } finally { setBusy(false); }
  }

  return <main className="login panel">
    <p className="brand" style={{color:"#176b50"}}>THE CLINIQ</p>
    <h1>Activate your Doctor Portal account</h1>
    <p>Your doctor account was created by your clinic and approved by The CliniQ Platform. Sign in with your verified Firebase email and password to activate Doctor Portal access.</p>
    <p className="muted">Account activation is separate from professional verification. Your professional verification remains pending until you submit evidence and it is reviewed.</p>
    <form onSubmit={event=>void submit(event)}>
      <label>Email<input autoComplete="email" disabled={busy} onChange={event=>setEmail(event.target.value)} required type="email" value={email}/></label>
      <label>Password<input autoComplete="current-password" disabled={busy} onChange={event=>setPassword(event.target.value)} required type="password" value={password}/></label>
      <button disabled={busy} type="submit">{busy?"Activating…":"Activate account"}</button>
    </form>
    <button disabled={busy || authEmailCooldownActive(verificationCooldownUntil) || !email.trim() || !password} onClick={() => void resendVerification()} type="button">{authEmailCooldownActive(verificationCooldownUntil) ? "Resend available shortly" : "Resend verification email"}</button>
    <p className="muted">This page does not create or send passwords. If you do not yet have verified Firebase credentials, contact The CliniQ support team for the next activation step.</p>
    <Link className="secondary-link" href="/sign-in">Go to Provider sign in</Link>
    {notice?<p className="feedback">{notice}</p>:null}
    {error?<p className="error">{error}</p>:null}
  </main>;
}
