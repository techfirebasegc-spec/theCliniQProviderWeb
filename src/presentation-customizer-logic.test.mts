import assert from "node:assert/strict";
import test from "node:test";
import { canUse,presentationAssetCapability,presentationTemplateCards,validPresentationColor } from "./presentation-customizer-logic.ts";
test("derives template cards without treating unavailable templates as selectable",()=>{assert.deepEqual(presentationTemplateCards([{key:"professional",displayName:"Professional"}]),[{key:"professional",displayName:"Professional",available:true},{key:"premium",displayName:"Premium",available:false},{key:"minimal",displayName:"Minimal",available:false}]);});
test("uses only explicit capability grants and valid API colors",()=>{assert.equal(canUse({"presentation.colors.custom":true},"presentation.colors.custom"),true);assert.equal(canUse({},"presentation.colors.custom"),false);assert.equal(validPresentationColor("#0a47a9"),true);assert.equal(validPresentationColor("blue"),false);assert.equal(presentationAssetCapability("HERO_IMAGE"),"presentation.hero-image");});
