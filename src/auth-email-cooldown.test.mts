import { strict as assert } from "node:assert";
import { authEmailCooldownActive, authEmailCooldownMilliseconds, nextAuthEmailCooldown } from "./auth-email-cooldown.ts";

const now = 1_000;
assert.equal(nextAuthEmailCooldown(now), now + authEmailCooldownMilliseconds);
assert.equal(authEmailCooldownActive(nextAuthEmailCooldown(now), now), true);
assert.equal(authEmailCooldownActive(nextAuthEmailCooldown(now), now + authEmailCooldownMilliseconds), false);
