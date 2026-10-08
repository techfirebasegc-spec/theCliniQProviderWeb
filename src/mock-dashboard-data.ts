export const clinicianDashboardDemo = {
  metrics: [
    { label: "Today’s appointments", value: "8", detail: "+12% vs last week", trend: "up" },
    { label: "Upcoming", value: "5", detail: "Next: 10:30 AM", trend: "neutral" },
    { label: "Completed", value: "24", detail: "This month", trend: "up" },
    { label: "Revenue", value: "₹28,500", detail: "+14.2% this month", trend: "up" },
    { label: "New patients", value: "12", detail: "This month", trend: "up" },
    { label: "Cancellation rate", value: "4.2%", detail: "Down 3.2%", trend: "down" },
  ],
  appointments: [
    ["09:00 AM", "Physiotherapy Consultation", "Completed"],
    ["10:30 AM", "Physiotherapy Home Visit", "Upcoming"],
    ["12:00 PM", "Physiotherapy Consultation", "Upcoming"],
    ["03:30 PM", "Physiotherapy Home Visit", "Upcoming"],
  ],
  services: [
    ["Physiotherapy Consultation", "24", "₹24,000", "78%"],
    ["Physiotherapy Home Visit", "16", "₹16,000", "64%"],
  ],
  activity: ["Appointment completed", "New appointment booked", "Availability updated", "Profile updated"],
};
