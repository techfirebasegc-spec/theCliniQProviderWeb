import assert from "node:assert/strict";
import test from "node:test";
import { getPublicEmbedUrl, getPublicEmbedUrlFromPath } from "./public-embed-url.ts";
test("uses the canonical Patient Web origin for doctor and clinic embeds",()=>{assert.equal(getPublicEmbedUrl({kind:"DOCTOR",slug:"doctor-example"}),"https://thecliniq.co.in/embed/doctors/doctor-example");assert.equal(getPublicEmbedUrl({kind:"CLINIC",slug:"clinic-example"}),"https://thecliniq.co.in/embed/clinics/clinic-example");assert.equal(getPublicEmbedUrlFromPath("/embed/doctors/doctor-example"),"https://thecliniq.co.in/embed/doctors/doctor-example");});
