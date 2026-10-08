const paths: Record<string, string> = {
  "⌂": "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  "▦": "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  "♙": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-4M17 3a4 4 0 0 1 0 8",
  "◷": "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2M8 14h3M8 17h6",
  "◫": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
  "⚙": "M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  menu: "M4 6h16M4 12h16M4 18h16",
  chevronDown: "m6 9 6 6 6-6",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  logout: "M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5",
  appearance: "M12 3a9 9 0 1 0 9 9c0-2-2-3-4-3-1.5 0-2.5 1-2.5 2.5 0 1.2-.8 2.5-2.5 2.5H11a2 2 0 0 0-2 2c0 1.1.9 2 2 2h1",
  sidebarCollapse: "M4 5h16M4 12h10M4 19h16M14 9l3 3-3 3",
  sidebarExpand: "M4 5h16M4 12h10M4 19h16M17 9l-3 3 3 3",
  save: "M5 3h12l3 3v15H4V3h1Zm2 0v6h9V3M8 21v-7h8v7",
  play: "m9 5 10 7-10 7V5Z",
  check: "m5 12 4 4L19 6",
};
export function ProviderIcon({ name }: { name: string }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] ?? paths["▦"]}/></svg>;
}
