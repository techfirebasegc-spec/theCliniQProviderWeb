export type PublicEmbedSubject = { kind: "DOCTOR" | "CLINIC"; slug: string };
const publicOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thecliniq.co.in").replace(/\/$/, "");
export function getPublicEmbedUrl(subject: PublicEmbedSubject): string { return `${publicOrigin}/embed/${subject.kind === "DOCTOR" ? "doctors" : "clinics"}/${encodeURIComponent(subject.slug)}`; }
export function getPublicEmbedUrlFromPath(path: string): string { const match = path.match(/^\/embed\/(doctors|clinics)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/); if (!match) throw new Error("The provider API returned an invalid embed path."); return getPublicEmbedUrl({ kind: match[1] === "doctors" ? "DOCTOR" : "CLINIC", slug: match[2] }); }
