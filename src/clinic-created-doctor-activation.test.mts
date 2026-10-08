import assert from "node:assert/strict";
import test from "node:test";
import { activateClinicCreatedDoctor, activationMessage } from "./clinic-created-doctor-activation.ts";

const verifiedUser = { emailVerified:true, getIdToken:async()=>"verified-token" };

test("claims an approved doctor before creating the Provider session",async()=>{
  const calls:string[]=[];
  const request = async (path:string) => { calls.push(path); return undefined as never; };
  assert.equal(await activateClinicCreatedDoctor(verifiedUser,request),"ACTIVATED");
  assert.deepEqual(calls,["/v1/auth/provider/clinic-created-doctors/claim","/v1/auth/provider/firebase/session"]);
});

test("does not call the claim API for an unverified Firebase email",async()=>{
  let calls=0;
  const result=await activateClinicCreatedDoctor({emailVerified:false,getIdToken:async()=>"token"},async()=>{calls++; return undefined as never;});
  assert.equal(result,"EMAIL_NOT_VERIFIED");
  assert.equal(calls,0);
});

test("maps rejected and already-claimed requests to a safe activation error",async()=>{
  const result=await activateClinicCreatedDoctor(verifiedUser,async()=>{throw {status:403,message:"internal detail"};});
  assert.equal(result,"CLAIM_NOT_PERMITTED");
  assert.doesNotMatch(activationMessage(result),/internal detail/i);
});

test("reports a session failure after a successful claim",async()=>{
  let calls=0;
  const result=await activateClinicCreatedDoctor(verifiedUser,async()=>{calls++; if(calls===2)throw {status:401,message:"session failed"}; return undefined as never;});
  assert.equal(result,"SESSION_FAILED");
});
