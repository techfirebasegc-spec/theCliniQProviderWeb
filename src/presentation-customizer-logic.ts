export type CapabilityMap=Record<string,boolean>;
export type TemplateCard={key:string;displayName:string;available:boolean};
export const presentationTemplateCards=(available:Array<{key:string;displayName:string}>):TemplateCard[]=>["professional","premium","minimal"].map(key=>{const match=available.find(template=>template.key===key);return{key,displayName:match?.displayName??`${key[0].toUpperCase()}${key.slice(1)}`,available:Boolean(match)};});
export const canUse=(capabilities:CapabilityMap,key:string)=>capabilities[key]===true;
export const validPresentationColor=(value:string|null)=>value===null||/^#[0-9A-Fa-f]{6}$/.test(value);
export const presentationAssetCapability=(kind:"LOGO"|"HERO_IMAGE"|"BACKGROUND_IMAGE")=>kind==="LOGO"?"presentation.logo":kind==="HERO_IMAGE"?"presentation.hero-image":"presentation.background-image";
