import assert from "node:assert/strict";
import test from "node:test";
import {
  daysFromRecurrence,
  daysToSeconds,
  formatRupees,
  hoursMinutesToSeconds,
  recurrenceFromDays,
  rupeesToMinor,
  secondsToDays,
  secondsToHoursMinutes,
} from "./provider-formats.ts";

test("converts decimal rupees to exact API minor units", () => {
  assert.equal(rupeesToMinor("500"), "50000");
  assert.equal(rupeesToMinor("500.5"), "50050");
  assert.equal(rupeesToMinor("2,000.50"), "200050");
  assert.equal(rupeesToMinor("500.500"), null);
  assert.equal(rupeesToMinor("1e3"), null);
});

test("formats minor units as Indian rupees without precision loss", () => {
  assert.equal(formatRupees("200000"), "₹2,000.00");
  assert.equal(formatRupees("200050"), "₹2,000.50");
  assert.equal(formatRupees("12345678901234567890"), "₹1,23,45,67,89,01,23,45,678.90");
});

test("converts duration and booking-horizon fields", () => {
  assert.equal(hoursMinutesToSeconds({ hours: "1", minutes: "30" }, true), 5400);
  assert.equal(hoursMinutesToSeconds({ hours: "0", minutes: "00" }, true), null);
  assert.equal(hoursMinutesToSeconds({ hours: "1", minutes: "60" }), null);
  assert.deepEqual(secondsToHoursMinutes(1800), { hours: "00", minutes: "30" });
  assert.deepEqual(secondsToHoursMinutes(3600), { hours: "01", minutes: "00" });
  assert.deepEqual(secondsToHoursMinutes(5400), { hours: "01", minutes: "30" });
  assert.equal(daysToSeconds("30"), 2_592_000);
  assert.equal(secondsToDays(2_592_000), "30");
});

test("builds and reads the existing weekly recurrence value", () => {
  assert.equal(recurrenceFromDays([1, 3, 5]), "FREQ=WEEKLY;BYDAY=MO,WE,FR");
  assert.deepEqual(daysFromRecurrence("FREQ=WEEKLY;BYDAY=MO,WE,FR"), [1, 3, 5]);
});
