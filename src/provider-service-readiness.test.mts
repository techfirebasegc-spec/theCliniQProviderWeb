import assert from "node:assert/strict";
import test from "node:test";
import { selectEffectiveActiveVersion, serviceReadiness } from "./provider-service-readiness.ts";

const version = { id: "current", versionNumber: 1, status: "ACTIVE", effectiveFrom: "2026-01-01T00:00:00.000Z", effectiveTo: null, holdSeconds: 900 };
const onlineReady = { serviceStatus: "ACTIVE", version, availabilityStatus: "ACTIVE", exposureStatus: "PUBLISHED", publicDiscoveryStatus: "PUBLISHED" } as const;

test("clinic service without an active doctor assignment is not ready", () => assert.equal(serviceReadiness({ ...onlineReady, owner: "CLINIC", activeAssignmentCount: 0, assignmentState: "LOADED" }), "SETUP_INCOMPLETE"));
test("clinic service with an active doctor assignment is ready", () => assert.equal(serviceReadiness({ ...onlineReady, owner: "CLINIC", activeAssignmentCount: 1, assignmentState: "LOADED" }), "LIVE"));
test("doctor-owned service uses its owner doctor as the provider", () => assert.equal(serviceReadiness({ ...onlineReady, owner: "DOCTOR", activeAssignmentCount: 0, assignmentState: "LOADED" }), "LIVE"));
test("assignment-read failure is explicit", () => assert.equal(serviceReadiness({ ...onlineReady, owner: "CLINIC", activeAssignmentCount: 0, assignmentState: "UNAVAILABLE" }), "ASSIGNMENT_UNAVAILABLE"));
test("effective-version selection skips a future version", () => {
  const future = { ...version, id: "future", versionNumber: 2, effectiveFrom: "2027-01-01T00:00:00.000Z" };
  assert.equal(selectEffectiveActiveVersion([version, future], new Date("2026-06-01T00:00:00.000Z")).id, "current");
});
