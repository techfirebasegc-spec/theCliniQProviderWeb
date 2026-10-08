export type FirebasePasswordUser = {
  emailVerified: boolean;
  getIdToken(forceRefresh?: boolean): Promise<string>;
};

export type ActivationResult = "ACTIVATED" | "EMAIL_NOT_VERIFIED" | "CLAIM_NOT_PERMITTED" | "SESSION_FAILED";
export type ActivationRequest = (path: string, init: RequestInit) => Promise<unknown>;

/** Claims the approved clinic-created record before establishing the normal Provider session. */
export async function activateClinicCreatedDoctor(
  user: FirebasePasswordUser,
  request: ActivationRequest,
): Promise<ActivationResult> {
  if (!user.emailVerified) return "EMAIL_NOT_VERIFIED";

  const idToken = await user.getIdToken(true);
  try {
    await request("/v1/auth/provider/clinic-created-doctors/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch (error) {
    if (status(error) !== undefined && [401, 403, 409].includes(status(error)!)) return "CLAIM_NOT_PERMITTED";
    throw error;
  }

  try {
    await request("/v1/auth/provider/firebase/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return "ACTIVATED";
  } catch (error) {
    if (status(error) !== undefined) return "SESSION_FAILED";
    throw error;
  }
}

function status(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" ? error.status : undefined;
}

export function activationMessage(result: ActivationResult): string {
  switch (result) {
    case "EMAIL_NOT_VERIFIED": return "Verify your Firebase email address before activating your Doctor Portal account.";
    case "CLAIM_NOT_PERMITTED": return "This account could not be activated. It may not yet be approved, may already be activated, or this Firebase account belongs to another doctor.";
    case "SESSION_FAILED": return "Your account was activated, but Provider session setup could not be completed. Please sign in from the Provider sign-in page.";
    default: return "Your Doctor Portal account is active.";
  }
}
