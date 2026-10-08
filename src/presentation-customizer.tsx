"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { ChangeEvent, useEffect, useState } from "react";
import { api, context } from "./provider-app";
import {
  canUse,
  presentationAssetCapability,
  presentationTemplateCards,
  validPresentationColor,
} from "./presentation-customizer-logic";
import { getPublicEmbedUrlFromPath } from "./public-embed-url";
type Configuration = {
  templateKey: string;
  templateVersion: number;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  layoutOptions: Record<string, unknown>;
  sectionVisibility: Record<string, unknown>;
};
type Template = {
  key: string;
  version: number;
  displayName: string;
  description: string;
  layoutOptionSchema: Record<string, unknown>;
  sectionSchema: Record<string, unknown>;
  defaultConfiguration: Record<string, unknown>;
};
type Asset = {
  kind: "LOGO" | "HERO_IMAGE" | "BACKGROUND_IMAGE";
  contentType: string;
  byteSize: number;
};
type Presentation = {
  configuration: Configuration;
  capabilities: Record<string, boolean>;
  templates: Template[];
  assets: Asset[];
};
type Subject = {
  label: string;
  presentationPath: string;
  profilePath: string;
  embedPath: string;
};
type Profile = {
  displayName?: string | null;
  professionalTitle?: string | null;
  shortIntroduction?: string | null;
  biography?: string | null;
  about?: string | null;
};
type Embed = {
  enabled: boolean;
  allowedParentOrigins: string[];
  embedUrl: string;
};
const labels: Record<Asset["kind"], string> = {
  LOGO: "Logo",
  HERO_IMAGE: "Hero image",
  BACKGROUND_IMAGE: "Background image",
};
const message = (x: unknown, fallback: string) =>
  x instanceof Error ? x.message : fallback;
async function encode(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}
const entries = (schema: Record<string, unknown>) =>
  Object.entries(schema).filter(
    ([, rule]) =>
      rule === "boolean" || (typeof rule === "object" && rule !== null),
  );
export function DoctorPresentationCustomizer() {
  return <SubjectCustomizer kind="doctor" />;
}
export function ClinicPresentationCustomizer() {
  return <SubjectCustomizer kind="clinic" />;
}
function SubjectCustomizer({ kind }: { kind: "doctor" | "clinic" }) {
  const [subject, setSubject] = useState<Subject>();
  const [error, setError] = useState("");
  useEffect(() => {
    void context()
      .then((value) => {
        if (kind === "doctor") {
          if (!value.doctor)
            throw new Error(
              "A doctor profile is required for appearance customization.",
            );
          return {
            label: "Doctor",
            presentationPath: "/v1/me/doctor-profile/presentation",
            profilePath: "/v1/me/doctor-profile",
            embedPath: "/v1/me/doctor-profile/presentation/embed",
          };
        }
        const clinic = value.clinics[0];
        if (!clinic)
          throw new Error(
            "An authorized clinic context is required for appearance customization.",
          );
        return {
          label: "Clinic",
          presentationPath: `/v1/me/clinic/${clinic.id}/presentation`,
          profilePath: `/v1/me/clinic/${clinic.id}/profile`,
          embedPath: `/v1/me/clinic/${clinic.id}/presentation/embed`,
        };
      })
      .then(setSubject)
      .catch((x) => setError(message(x, "Unable to load profile context.")));
  }, [kind]);
  return subject ? (
    <>
      <PresentationCustomizer subject={subject} />
      <EmbedSettings subject={subject} />
    </>
  ) : (
    <section className="page">
      <p className="panel">{error || "Loading appearance customization…"}</p>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function EmbedSettings({ subject }: { subject: Subject }) {
  const [embed, setEmbed] = useState<Embed>();
  const [origin, setOrigin] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void api<Embed>(subject.embedPath)
      .then(setEmbed)
      .catch((x) => setNotice(message(x, "Unable to load embed settings.")));
  }, [subject.embedPath]);
  if (!embed) return null;
  const add = () => {
    const value = origin.trim();
    if (!/^(?:https:\/\/[a-z0-9.-]+|http:\/\/(?:localhost|127\.0\.0\.1|\[::1\]))(?::\d+)?$/i.test(value)) {
      setNotice("Enter a complete HTTPS website origin, or an HTTP localhost origin for local testing, without a path.");
      return;
    }
    setEmbed({
      ...embed,
      allowedParentOrigins: [
        ...new Set([...embed.allowedParentOrigins, value.toLowerCase()]),
      ].sort(),
    });
    setOrigin("");
  };
  const save = async () => {
    try {
      const next = await api<Embed>(subject.embedPath, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(embed),
      });
      setEmbed(next);
      setNotice("Embed settings saved.");
    } catch (x) {
      setNotice(message(x, "Unable to save embed settings."));
    }
  };
  const embedUrl = getPublicEmbedUrlFromPath(embed.embedUrl);
  const snippet = `<iframe src="${embedUrl}" width="100%" style="border:0;" loading="lazy" title="${subject.label} profile"></iframe>`;
  return (
    <section className="page presentation-page">
      <section className="panel">
        <h2>Website Embed</h2>
        <p className="muted">
          Embed your published profile on approved websites.
        </p>
        <label className="check-field">
          <input
            type="checkbox"
            checked={embed.enabled}
            onChange={(event) =>
              setEmbed({ ...embed, enabled: event.target.checked })
            }
          />{" "}
          Enable embedding
        </label>
        <div className="asset-row">
          <input
            value={origin}
            placeholder="https://www.example.com"
            onChange={(event) => setOrigin(event.target.value)}
          />
          <button type="button" className="secondary-button" onClick={add}>
            Add website
          </button>
        </div>
        {embed.allowedParentOrigins.map((value) => (
          <div className="asset-row" key={value}>
            <code>{value}</code>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setEmbed({
                  ...embed,
                  allowedParentOrigins: embed.allowedParentOrigins.filter(
                    (item) => item !== value,
                  ),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => void save()}>
          Save embed settings
        </button>
        <p className="muted">
          Embed URL: <code>{embedUrl}</code>
        </p>
        <textarea readOnly value={snippet} aria-label="Iframe code" />
        <div className="asset-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigator.clipboard
                ?.writeText(snippet)
                .then(() => setNotice("Iframe code copied."))
                .catch(() => setNotice("Copy is unavailable in this browser."))
            }
          >
            Copy code
          </button>
          <a
            className="secondary-button"
            href={embedUrl}
            target="_blank"
            rel="noreferrer"
          >
            Preview
          </a>
        </div>
        {notice ? (
          <p className="feedback" role="status">
            {notice}
          </p>
        ) : null}
      </section>
    </section>
  );
}
function PresentationCustomizer({ subject }: { subject: Subject }) {
  const [presentation, setPresentation] = useState<Presentation>();
  const [profile, setProfile] = useState<Profile>();
  const [draft, setDraft] = useState<Configuration>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState<
    Partial<Record<Asset["kind"], string>>
  >({});
  async function load() {
    const [raw, next] = await Promise.all([
      api<Presentation>(subject.presentationPath),
      api<Profile>(subject.profilePath),
    ]);
    const source = raw ?? ({} as Presentation);
    if (!source.configuration)
      throw new Error(
        "Presentation configuration was not returned by the provider API.",
      );
    const configuration: Configuration = {
      ...source.configuration,
      primaryColor: source.configuration.primaryColor ?? null,
      secondaryColor: source.configuration.secondaryColor ?? null,
      accentColor: source.configuration.accentColor ?? null,
      layoutOptions: source.configuration.layoutOptions ?? {},
      sectionVisibility: source.configuration.sectionVisibility ?? {},
    };
    const p: Presentation = {
      configuration,
      capabilities: source.capabilities ?? {},
      templates: Array.isArray(source.templates) ? source.templates : [],
      assets: Array.isArray(source.assets) ? source.assets : [],
    };
    setPresentation(p);
    setProfile(next ?? {});
    setDraft(p.configuration);
  }
  useEffect(() => {
    void load().catch((x) =>
      setNotice(message(x, "Unable to load appearance customization.")),
    );
  }, [subject.presentationPath, subject.profilePath]);
  async function save() {
    if (!draft) return;
    if (
      ![draft.primaryColor, draft.secondaryColor, draft.accentColor].every(
        validPresentationColor,
      )
    ) {
      setNotice("Use a six-digit hex color, for example #0A47A9.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      await api(subject.presentationPath, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      await load();
      setNotice("Appearance saved.");
    } catch (x) {
      setNotice(message(x, "Unable to save appearance."));
    } finally {
      setBusy(false);
    }
  }
  function choose(template: Template) {
    if (
      !draft ||
      !presentation ||
      !canUse(
        presentation.capabilities,
        `presentation.template.${template.key}`,
      )
    )
      return;
    const defaults = template.defaultConfiguration;
    setDraft({
      ...draft,
      templateKey: template.key,
      templateVersion: template.version,
      layoutOptions:
        (defaults.layoutOptions as Record<string, unknown>) ??
        draft.layoutOptions,
      sectionVisibility:
        (defaults.sectionVisibility as Record<string, unknown>) ??
        draft.sectionVisibility,
    });
  }
  async function upload(
    kind: Asset["kind"],
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (
      !file ||
      !presentation ||
      !canUse(presentation.capabilities, presentationAssetCapability(kind))
    )
      return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 4 * 1024 * 1024
    ) {
      setNotice("Choose a PNG, JPEG, or WebP image smaller than 4 MB.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      setUploads((value) => ({ ...value, [kind]: URL.createObjectURL(file) }));
      await api(`${subject.presentationPath}/assets/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          originalFilename: file.name,
          contentType: file.type,
          contentBase64: await encode(file),
        }),
      });
      await load();
      setNotice(`${labels[kind]} uploaded.`);
    } catch (x) {
      setNotice(message(x, "Unable to upload image."));
    } finally {
      setBusy(false);
    }
  }
  const selected = presentation?.templates?.find(
    (item) =>
      item.key === draft?.templateKey &&
      item.version === draft?.templateVersion,
  );
  if (!presentation || !draft)
    return (
      <section className="page">
        <p className="panel">{notice || "Loading appearance customization…"}</p>
      </section>
    );
  const colors = canUse(
      presentation.capabilities,
      "presentation.colors.custom",
    ),
    layout = canUse(presentation.capabilities, "presentation.layout.advanced");
  return (
    <section className="page presentation-page">
      <header className="presentation-header">
        <div>
          <p className="eyebrow">{subject.label} profile</p>
          <h1>Customize your profile</h1>
          <p className="muted">
            These choices affect how your public profile is presented.
          </p>
        </div>
        <button className="primary-button button-save" disabled={busy} onClick={() => void save()}>
          {busy ? "Saving…" : "Save appearance"}
        </button>
      </header>
      {notice ? (
        <p
          className={
            notice.startsWith("Unable") ||
            notice.startsWith("Use") ||
            notice.startsWith("Choose")
              ? "error"
              : "feedback"
          }
          role="status"
        >
          {notice}
        </p>
      ) : null}
      <div className="presentation-grid">
        <main className="presentation-controls">
          <section className="panel">
            <h2>Template</h2>
            <p className="muted">
              Select a presentation template available to your account.
            </p>
            <div className="template-grid">
              {presentationTemplateCards(presentation.templates).map((card) => {
                const template = presentation.templates.find(
                    (item) => item.key === card.key,
                  ),
                  active = draft.templateKey === card.key;
                return (
                  <button
                    key={card.key}
                    type="button"
                    className={`template-card${active ? " selected" : ""}`}
                    disabled={!card.available || busy}
                    aria-pressed={active}
                    onClick={() => template && choose(template)}
                  >
                    <span className="template-swatch" />
                    <strong>{card.displayName}</strong>
                    <span>
                      {card.available
                        ? active
                          ? "Selected"
                          : "Available"
                        : "Available with an upgraded presentation package."}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="panel">
            <h2>Colors</h2>
            <p className="muted">
              Use controlled colors supported by your presentation package.
            </p>
            {(
              [
                ["primaryColor", "Primary color"],
                ["secondaryColor", "Secondary / surface color"],
                ["accentColor", "Accent color"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="color-field">
                {label}
                <span>
                  <input
                    aria-label={`${label} picker`}
                    type="color"
                    disabled={!colors || busy}
                    value={draft[key] ?? "#0A47A9"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [key]: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <input
                    aria-label={`${label} hex value`}
                    disabled={!colors || busy}
                    value={draft[key] ?? ""}
                    placeholder="#0A47A9"
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  />
                </span>
              </label>
            ))}
            {!colors ? (
              <p className="muted">
                Available with an upgraded presentation package.
              </p>
            ) : null}
          </section>
          <section className="panel">
            <h2>Layout and sections</h2>
            {selected ? (
              <Schema
                schema={selected.layoutOptionSchema}
                values={draft.layoutOptions}
                disabled={!layout || busy}
                title="Layout"
                onChange={(value) =>
                  setDraft({ ...draft, layoutOptions: value })
                }
              />
            ) : null}
            {selected ? (
              <Schema
                schema={selected.sectionSchema}
                values={draft.sectionVisibility}
                disabled={!layout || busy}
                title="Visible sections"
                onChange={(value) =>
                  setDraft({ ...draft, sectionVisibility: value })
                }
              />
            ) : null}
            {!layout ? (
              <p className="muted">
                Available with an upgraded presentation package.
              </p>
            ) : null}
          </section>
          <section className="panel">
            <h2>Profile assets</h2>
            <p className="muted">
              Images upload immediately. Existing assets remain active until a
              replacement succeeds.
            </p>
            {(["LOGO", "HERO_IMAGE", "BACKGROUND_IMAGE"] as const).map(
              (kind) => {
                const allowed = canUse(
                    presentation.capabilities,
                    presentationAssetCapability(kind),
                  ),
                  existing = presentation.assets.find(
                    (asset) => asset.kind === kind,
                  );
                return (
                  <div className="asset-row" key={kind}>
                    {uploads[kind] ? (
                      <img
                        src={uploads[kind]}
                        alt={`New ${labels[kind]} preview`}
                      />
                    ) : (
                      <span className="asset-placeholder" aria-hidden="true">
                        {labels[kind][0]}
                      </span>
                    )}
                    <div>
                      <strong>{labels[kind]}</strong>
                      <p className="muted">
                        {existing
                          ? "Uploaded image ready to use."
                          : "No image uploaded."}
                      </p>
                      {allowed ? (
                        <label className="secondary-button">
                          {existing ? "Replace image" : "Upload image"}
                          <input
                            className="visually-hidden"
                            disabled={busy}
                            accept="image/png,image/jpeg,image/webp"
                            type="file"
                            onChange={(event) => void upload(kind, event)}
                          />
                        </label>
                      ) : (
                        <p className="muted">
                          Available with an upgraded presentation package.
                        </p>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </section>
        </main>
        <Preview draft={draft} profile={profile} uploads={uploads} />
      </div>
    </section>
  );
}
function Schema({
  schema,
  values,
  disabled,
  title,
  onChange,
}: {
  schema: Record<string, unknown>;
  values: Record<string, unknown>;
  disabled: boolean;
  title: string;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const available = entries(schema);
  if (!available.length) return null;
  return (
    <fieldset disabled={disabled}>
      <legend>{title}</legend>
      {available.map(([key, rule]) => {
        const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (x) => x.toUpperCase()),
          boolean =
            rule === "boolean" ||
            (typeof rule === "object" &&
              rule !== null &&
              (rule as { type?: unknown }).type === "boolean");
        if (boolean)
          return (
            <label className="selection-tile" key={key}>
              <input
                type="checkbox"
                checked={values[key] === true}
                onChange={(e) =>
                  onChange({ ...values, [key]: e.target.checked })
                }
              />
              {label}
            </label>
          );
        const options =
          typeof rule === "object" &&
          rule !== null &&
          Array.isArray((rule as { enum?: unknown }).enum)
            ? (rule as { enum: string[] }).enum
            : [];
        return (
          <label className="settings-field" key={key}>
            {label}
            <select
              className="clinician-select"
              value={
                typeof values[key] === "string"
                  ? values[key]
                  : (options[0] ?? "")
              }
              onChange={(e) => onChange({ ...values, [key]: e.target.value })}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/([A-Z])/g, " $1").replace(/-/g, " ").replace(/^./, (value) => value.toUpperCase())}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </fieldset>
  );
}
function Preview({
  draft,
  profile,
  uploads,
}: {
  draft: Configuration;
  profile: Profile | undefined;
  uploads: Partial<Record<Asset["kind"], string>>;
}) {
  const name = profile?.displayName || "Your professional profile",
    description =
      profile?.shortIntroduction ||
      profile?.about ||
      profile?.biography ||
      "Add a concise introduction from your profile settings.",
    style = {
      "--preview-primary": draft.primaryColor ?? "#0A47A9",
      "--preview-secondary": draft.secondaryColor ?? "#EDF4FF",
      "--preview-accent": draft.accentColor ?? "#1B8A72",
    } as React.CSSProperties;
  return (
    <aside
      className={`presentation-preview template-${draft.templateKey}`}
      style={style}
    >
      <p className="eyebrow">Live preview</p>
      <div className="preview-card">
        {uploads.HERO_IMAGE ? (
          <img
            className="preview-hero-image"
            src={uploads.HERO_IMAGE}
            alt="Hero preview"
          />
        ) : null}
        <div className="preview-hero">
          <span className="preview-avatar">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2>{name}</h2>
            {profile?.professionalTitle ? (
              <p>{profile.professionalTitle}</p>
            ) : null}
          </div>
        </div>
        {draft.sectionVisibility.about !== false ? (
          <section>
            <h3>About</h3>
            <p>{description}</p>
          </section>
        ) : null}
        {draft.sectionVisibility.qualifications !== false ? (
          <section>
            <h3>Profile details</h3>
            <p>
              Professional information shown according to the selected template.
            </p>
          </section>
        ) : null}
        <span className="preview-template">{draft.templateKey} template</span>
      </div>
    </aside>
  );
}
