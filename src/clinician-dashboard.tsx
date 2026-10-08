"use client";

import { useEffect, useState } from "react";
import { clinicianDashboardDemo } from "./mock-dashboard-data";
import { context, ProviderShell, type Context } from "./provider-app";

const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

export function ClinicianDashboard() {
  const [provider, setProvider] = useState<Context>();
  const [range, setRange] = useState("7 days");
  useEffect(() => { void context().then(setProvider); }, []);
  const name = provider?.doctor?.displayName ?? provider?.clinics[0]?.displayName ?? "Clinician";
  const title = provider?.doctor ? "Clinician" : "Clinic workspace";
  return <ProviderShell><section className="clinician-dashboard page">
    <header className="dashboard-header"><div><p className="eyebrow">{title}</p><h1>Good morning, {name}</h1><p className="muted">Today&apos;s overview of your practice</p></div><time>{today}</time></header>
    <p className="demo-note">Demo analytics · Sample values are not connected to patient records.</p>
    <section className="kpi-grid" aria-label="Practice summary">{clinicianDashboardDemo.metrics.map((metric) => <article className={`kpi-card trend-${metric.trend}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></article>)}</section>
    <section className="dashboard-two-column"><article className="analytics-card"><header><div><p className="eyebrow">Appointment analytics</p><h2>Appointments overview</h2></div><div className="range-tabs" role="group" aria-label="Appointment date range">{["7 days", "30 days", "90 days", "This year"].map((item) => <button aria-pressed={range === item} className={range === item ? "selected" : ""} key={item} onClick={() => setRange(item)} type="button">{item}</button>)}</div></header><div className="chart-placeholder" aria-label={`Sample ${range} appointment chart`}><div className="chart-bars">{[42, 68, 55, 82, 61, 76, 48].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div className="chart-legend"><span><i className="completed" />Completed</span><span><i className="upcoming" />Upcoming</span><span><i className="cancelled" />Cancelled</span></div></div></article><article className="analytics-card revenue-card"><p className="eyebrow">Revenue</p><h2>₹28,500 <small>+14.2%</small></h2><p className="muted">This month · Demo analytics</p><div className="revenue-spark" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div></article></section>
    <section className="dashboard-three-column"><article className="workspace-card schedule-card"><header><div><p className="eyebrow">Today&apos;s schedule</p><h2>Appointments</h2></div><span className="status-badge">Demo</span></header><ol>{clinicianDashboardDemo.appointments.map(([time, service, status]) => <li key={`${time}-${service}`}><time>{time}</time><div><strong>{service}</strong><span>Patient details appear after booking</span></div><em className={`appointment-status ${status.toLowerCase()}`}>{status}</em></li>)}</ol></article><article className="workspace-card"><header><div><p className="eyebrow">Patient insights</p><h2>Patient mix</h2></div></header><dl className="insight-grid"><div><dt>Total patients</dt><dd>128</dd></div><div><dt>Returning</dt><dd>76</dd></div><div><dt>New patients</dt><dd>52</dd></div><div><dt>Retention</dt><dd>68%</dd></div></dl></article><article className="workspace-card activity-card"><header><div><p className="eyebrow">Recent activity</p><h2>Practice updates</h2></div></header><ul>{clinicianDashboardDemo.activity.map((item, index) => <li key={item}><span>{index + 1}</span><div><strong>{item}</strong><small>{index === 0 ? "Today" : "This week"}</small></div></li>)}</ul></article></section>
    <section className="workspace-card services-performance"><header><div><p className="eyebrow">Service performance</p><h2>Your services</h2></div></header><div role="table"><div className="service-performance-heading" role="row"><span>Service</span><span>Appointments</span><span>Revenue</span><span>Utilization</span></div>{clinicianDashboardDemo.services.map(([service, appointments, revenue, utilization]) => <div role="row" key={service}><strong>{service}</strong><span>{appointments}</span><span>{revenue}</span><span>{utilization}</span></div>)}</div></section>
  </section></ProviderShell>;
}
