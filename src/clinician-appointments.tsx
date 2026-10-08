"use client";

import { useEffect, useMemo, useState } from "react";
import { api, context, ProviderShell } from "./provider-app";

type Appointment = { id: string; status: string; startsAt: string; endsAt: string; serviceName: string };
const label = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, (value) => value.toUpperCase());

export function ClinicianAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string>();
  async function load() { const current = await context(); if (!current.doctor) return setItems([]); setItems((await api<{ items: Appointment[] }>("/v1/provider/doctor/appointments")).items); }
  useEffect(() => { queueMicrotask(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load appointments.")); }); }, []);
  const visible = useMemo(() => items.filter((item) => filter === "ALL" || (filter === "UPCOMING" ? ["CONFIRMED", "PAYMENT_PENDING", "IN_PROGRESS"].includes(item.status) : item.status === filter)), [filter, items]);
  async function transition(item: Appointment, action: "start" | "complete") { setBusy(item.id); setMessage(""); try { await api(`/v1/appointments/${encodeURIComponent(item.id)}/${action}`, { method: "POST" }); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update appointment."); } finally { setBusy(undefined); } }
  return <ProviderShell><section className="appointments-workspace page">
    <header className="page-heading"><div><p className="eyebrow">Practice operations</p><h1>Appointments</h1><p className="muted">Review and manage appointments booked with you.</p></div><span className="appointment-count">{items.length} total</span></header>
    <div className="appointment-toolbar"><div className="filter-tabs" role="group" aria-label="Appointment status filter">{[["ALL", "All"], ["UPCOMING", "Upcoming"], ["COMPLETED", "Completed"], ["CANCELLED", "Cancelled"]].map(([value, name]) => <button aria-pressed={filter === value} className={filter === value ? "selected" : ""} key={value} onClick={() => setFilter(value)} type="button">{name}</button>)}</div></div>
    <section className="appointment-list" aria-live="polite">{visible.map((item) => <article className="appointment-row" key={item.id}>
      <div className="appointment-state"><span className={`status-badge status-${item.status.toLowerCase()}`}>{label(item.status)}</span></div>
      <div className="appointment-when"><strong>{new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(item.startsAt))}</strong><span>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.startsAt))}</span></div>
      <div className="appointment-service"><span>Service</span><strong>{item.serviceName}</strong></div><div className="appointment-duration"><span>Duration</span><strong>{Math.round((Date.parse(item.endsAt) - Date.parse(item.startsAt)) / 60_000)} min</strong></div>
      <div className="appointment-actions">{item.status === "CONFIRMED" ? <button className="appointment-action appointment-action--start" disabled={busy !== undefined} onClick={() => void transition(item, "start")}>{busy === item.id ? "Starting…" : "Start consultation"}</button> : null}{item.status === "IN_PROGRESS" ? <button className="appointment-action appointment-action--complete" disabled={busy !== undefined} onClick={() => void transition(item, "complete")}>{busy === item.id ? "Completing…" : "Complete appointment"}</button> : null}</div>
    </article>)}{visible.length === 0 ? <div className="empty-state"><strong>No appointments in this view</strong><p>New confirmed appointments will appear here automatically.</p></div> : null}</section>
    {message ? <p className="error" role="alert">{message}</p> : null}
  </section></ProviderShell>;
}
