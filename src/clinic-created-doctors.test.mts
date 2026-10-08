import assert from "node:assert/strict";
import test from "node:test";
import { ProviderApiError } from "./provider-app.tsx";
import { clinicCreatedDoctorError,platformStatus } from "./clinic-created-doctors.ts";

test("maps created-doctor API errors without exposing credentials",()=>{
  assert.match(clinicCreatedDoctorError(new ProviderApiError(409,"conflict")),/email is already in use|configured doctor limit/i);
  assert.match(clinicCreatedDoctorError(new ProviderApiError(403,"forbidden")),/not permitted/i);
  assert.match(clinicCreatedDoctorError(new ProviderApiError(400,"bad request")),/check the doctor details/i);
});
test("keeps platform approval distinct from professional verification",()=>{
  assert.equal(platformStatus("PENDING"),"Pending approval");
  assert.equal(platformStatus("APPROVED"),"Approved");
  assert.equal(platformStatus("REJECTED"),"Rejected");
});
