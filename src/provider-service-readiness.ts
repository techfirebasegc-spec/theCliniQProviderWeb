export type EffectiveVersion = {
  id: string;
  versionNumber: number;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  holdSeconds: number | null;
};

export type AssignmentState = "LOADED" | "UNAVAILABLE";
export type ServiceReadiness = "LIVE" | "SETUP_INCOMPLETE" | "ASSIGNMENT_UNAVAILABLE";

export function selectEffectiveActiveVersion<T extends EffectiveVersion>(versions: T[], at: Date): T | undefined {
  const time = at.getTime();
  return versions
    .filter((version) => version.status === "ACTIVE" && new Date(version.effectiveFrom).getTime() <= time && (!version.effectiveTo || new Date(version.effectiveTo).getTime() > time))
    .sort((left, right) => new Date(right.effectiveFrom).getTime() - new Date(left.effectiveFrom).getTime())[0];
}

export function serviceReadiness(input: {
  owner: "DOCTOR" | "CLINIC";
  serviceStatus: string;
  version: EffectiveVersion | undefined;
  availabilityStatus: string | undefined;
  exposureStatus: string | null;
  publicDiscoveryStatus: string | null;
  activeAssignmentCount: number;
  assignmentState: AssignmentState;
}): ServiceReadiness {
  if (input.owner === "CLINIC" && input.assignmentState === "UNAVAILABLE") return "ASSIGNMENT_UNAVAILABLE";
  const hasProvider = input.owner === "DOCTOR" || input.activeAssignmentCount > 0;
  return input.serviceStatus === "ACTIVE" && input.version?.status === "ACTIVE" && input.version.holdSeconds !== null && input.availabilityStatus === "ACTIVE" && input.exposureStatus === "PUBLISHED" && input.publicDiscoveryStatus === "PUBLISHED" && hasProvider ? "LIVE" : "SETUP_INCOMPLETE";
}
