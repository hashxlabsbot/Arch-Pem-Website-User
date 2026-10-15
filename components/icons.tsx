import React from 'react'

interface P {
  size?: number
  color?: string
  strokeWidth?: number
  style?: React.CSSProperties
  className?: string
}

function S({ size = 16, color = 'currentColor', strokeWidth = 1.75, style, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Bar chart bars — Dashboard, Analytics, Management */
export function DashboardIcon(p: P) {
  return (
    <S {...p}>
      <rect x="3" y="14" width="4" height="8" rx="1" fill="currentColor" stroke="none" />
      <rect x="10" y="8" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="17" y="3" width="4" height="19" rx="1" fill="currentColor" stroke="none" />
      <line x1="2" y1="22" x2="22" y2="22" strokeWidth="1.5" />
    </S>
  )
}

/** Folder — Projects, Files */
export function FolderIcon(p: P) {
  return (
    <S {...p}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </S>
  )
}

/** Wallet / coin purse — Expenses, Finance */
export function WalletIcon(p: P) {
  return (
    <S {...p}>
      <rect x="1" y="8" width="22" height="13" rx="2" />
      <path d="M1 13h22" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <path d="M5 5h14" />
    </S>
  )
}

/** Clock — Pending Payments */
export function ClockIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16.5 14.5" />
    </S>
  )
}

/** Receipt / bill strip — GST Report */
export function ReceiptIcon(p: P) {
  return (
    <S {...p}>
      <path d="M4 2v20l4-2 4 2 4-2 4 2V2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
    </S>
  )
}

/** Document with lines — Summary Sheet */
export function DocumentIcon(p: P) {
  return (
    <S {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="7" y1="13" x2="17" y2="13" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </S>
  )
}

/** Two people silhouettes — Party Directory */
export function UsersIcon(p: P) {
  return (
    <S {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </S>
  )
}

/** Cog / gear — Settings */
export function SettingsIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </S>
  )
}

/** Building / house — Construction Teams, Hero tag */
export function BuildingIcon(p: P) {
  return (
    <S {...p}>
      <line x1="3" y1="22" x2="21" y2="22" />
      <polyline points="5 22 5 10 12 3 19 10 19 22" />
      <rect x="9" y="15" width="6" height="7" />
    </S>
  )
}

/** Padlock — URL bar security */
export function LockIcon(p: P) {
  return (
    <S {...p}>
      <rect x="5" y="11" width="14" height="11" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Clipboard with lines — BOQ & Budget, Registers */
export function ClipboardIcon(p: P) {
  return (
    <S {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="14" y2="15" />
    </S>
  )
}

/** Storefront — Vendor Tracking */
export function StoreIcon(p: P) {
  return (
    <S {...p}>
      <path d="M4 4h16l2 6H2L4 4z" />
      <path d="M2 10v11a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V10" />
      <rect x="9" y="15" width="6" height="7" />
    </S>
  )
}

/** Person with hard hat — Labour Tracking */
export function HardHatIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="12" cy="15" r="4" />
      <path d="M6 11a6 6 0 0 1 12 0H6z" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <path d="M5 22a8 8 0 0 1 14 0" />
    </S>
  )
}

/** Lightning bolt — Speed, Accounting, Center icon */
export function BoltIcon(p: P) {
  return (
    <S {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Mobile phone — WhatsApp chip */
export function PhoneIcon(p: P) {
  return (
    <S {...p}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
    </S>
  )
}

/** Plain document / paper — Paper Bills, PDF */
export function FileIcon(p: P) {
  return (
    <S {...p}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </S>
  )
}

/** Trending downward arrow — Budget Overrun Reduction */
export function TrendingUpIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </S>
  )
}

export function TrendingDownIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </S>
  )
}

/** Rocket — Setup speed */
export function RocketIcon(p: P) {
  return (
    <S {...p}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </S>
  )
}

/** Drafting compass — Architecture showcase */
export function CompassIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="12" cy="5" r="2" />
      <line x1="10.9" y1="6.9" x2="7" y2="19" />
      <line x1="13.1" y1="6.9" x2="17" y2="19" />
      <line x1="8.5" y1="13" x2="15.5" y2="13" />
    </S>
  )
}

/** Printer — Print report button */
export function PrinterIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
      <circle cx="18.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Grid table — Excel / Export button */
export function ExportIcon(p: P) {
  return (
    <S {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </S>
  )
}

/** Warning triangle — Alert, Pending warnings */
export function WarningIcon(p: P) {
  return (
    <S {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Magnifier — Global Search */
export function SearchIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </S>
  )
}

/** Globe — Offline / no cloud */
export function GlobeIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </S>
  )
}

/** Circular arrows — Auto-update, Duplicate, Refresh */
export function RefreshIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </S>
  )
}

/** Delivery truck — Contractors / logistics */
export function TruckIcon(p: P) {
  return (
    <S {...p}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </S>
  )
}

/** Down arrow into tray — Download, Tally export, Templates */
export function DownloadIcon(p: P) {
  return (
    <S {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </S>
  )
}

/** Video camera — Video tutorials */
export function VideoIcon(p: P) {
  return (
    <S {...p}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </S>
  )
}

/** Bell — Product updates / notifications */
export function BellIcon(p: P) {
  return (
    <S {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </S>
  )
}

/** Speech bubble — Help Centre / chat */
export function ChatIcon(p: P) {
  return (
    <S {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </S>
  )
}

/** Floppy disk — Auto-backup / save */
export function SaveIcon(p: P) {
  return (
    <S {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </S>
  )
}

/** Opposing arrows — Comparison ("vs") */
export function CompareIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="17 11 21 7 17 3" />
      <line x1="21" y1="7" x2="3" y2="7" />
      <polyline points="7 21 3 17 7 13" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </S>
  )
}

/** Microphone — Voice assistant */
export function MicIcon(p: P) {
  return (
    <S {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </S>
  )
}

/** Chain link — Share / copy link */
export function LinkIcon(p: P) {
  return (
    <S {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </S>
  )
}

/** Arrow right — "read more" affordance on cards and CTAs */
export function ArrowRightIcon(p: P) {
  return (
    <S {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </S>
  )
}

/** Checkmark — success / copied state */
export function CheckIcon(p: P) {
  return (
    <S {...p}>
      <polyline points="20 6 9 17 4 12" />
    </S>
  )
}

/** Microphone with slash — Muted state */
export function MicOffIcon(p: P) {
  return (
    <S {...p}>
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M9 9v3a3 3 0 0 0 4.24 2.73" />
      <path d="M15 8.34V5a3 3 0 0 0-5.94-.6" />
      <path d="M5 10v1a7 7 0 0 0 10.34 6.13" />
      <path d="M19 10v1a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </S>
  )
}

/** Calculator — Free tools, cost calculator */
export function CalculatorIcon(p: P) {
  return (
    <S {...p}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6.5" x2="16" y2="6.5" />
      <circle cx="8.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="18" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
      <line x1="15.5" y1="14.5" x2="15.5" y2="18" strokeWidth="2" />
    </S>
  )
}

/** Rupee symbol — Bill generator, money tools */
export function RupeeIcon(p: P) {
  return (
    <S {...p}>
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13l8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </S>
  )
}

/** 3D cube — Concrete / volume calculator */
export function CubeIcon(p: P) {
  return (
    <S {...p}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </S>
  )
}

/** Brick wall — Brick calculator */
export function BricksIcon(p: P) {
  return (
    <S {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="5" x2="12" y2="12" />
      <line x1="7.5" y1="12" x2="7.5" y2="19" />
      <line x1="16.5" y1="12" x2="16.5" y2="19" />
    </S>
  )
}

/** TMT bar bundle (cross-section) — Steel weight calculator */
export function SteelIcon(p: P) {
  return (
    <S {...p}>
      <circle cx="8.5" cy="8.5" r="3.4" />
      <circle cx="15.5" cy="8.5" r="3.4" />
      <circle cx="12" cy="15.5" r="3.4" />
    </S>
  )
}

/** Diagonal ruler — Area / unit converter */
export function RulerIcon(p: P) {
  return (
    <S {...p}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </S>
  )
}

/** Flag on a milestone path — phase / milestone tracking */
export function MilestoneIcon(p: P) {
  return (
    <S {...p}>
      <path d="M5 21V4" />
      <path d="M5 4h10.5l-1.8 3.2a1 1 0 0 0 0 1l1.8 3.3H5" fill="currentColor" stroke="none" opacity=".9" />
      <path d="M5 4h10.5l-1.8 3.2a1 1 0 0 0 0 1l1.8 3.3H5" />
      <circle cx="5" cy="21" r="1.4" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Half-dial gauge with needle — budget utilisation / % complete */
export function GaugeIcon(p: P) {
  return (
    <S {...p}>
      <path d="M3.5 18a9 9 0 1 1 17 0" />
      <path d="m12 18 4.2-5.4" />
      <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </S>
  )
}

/** Google "G" mark — brand colours are fixed, not themeable via `color` */
export function GoogleIcon({ size = 18, style, className }: Pick<P, 'size' | 'style' | 'className'>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

/** WhatsApp glyph — filled brand mark, used on blog/tool share docks. */
export function WhatsappIcon({ size = 18, color = '#25D366', style, className }: Pick<P, 'size' | 'color' | 'style' | 'className'>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.84.5 3.56 1.36 5.04L2 22l5.12-1.34A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2a8.17 8.17 0 0 1-4.17-1.14l-.3-.18-3.04.8.81-2.96-.2-.3a8.18 8.18 0 0 1-1.26-4.4c0-4.53 3.68-8.21 8.2-8.21 4.52 0 8.2 3.68 8.2 8.2 0 4.53-3.68 8.2-8.2 8.2zm4.48-6.15c-.25-.12-1.46-.72-1.68-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.96-.14.17-.29.18-.54.06-1.46-.73-2.42-1.3-3.38-2.95-.26-.44.26-.41.73-1.37.08-.17.04-.31-.04-.44-.08-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.78 2.72 4.31 3.71 2.09.82 2.09.55 2.47.51.37-.04 1.46-.6 1.66-1.18.21-.58.21-1.08.15-1.18-.07-.11-.25-.17-.5-.3z" />
    </svg>
  )
}

/** LinkedIn "in" mark — filled brand square. */
export function LinkedinIcon({ size = 18, color = '#0A66C2', style, className }: Pick<P, 'size' | 'color' | 'style' | 'className'>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

/** X (Twitter) glyph — filled brand mark. */
export function XIcon({ size = 18, color = 'currentColor', style, className }: Pick<P, 'size' | 'color' | 'style' | 'className'>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
      className={className}
    >
      <path d="M17.53 2.75h3.08l-6.73 7.69 7.92 10.81h-6.2l-4.86-6.57-5.56 6.57H2.1l7.2-8.23L1.7 2.75h6.36l4.4 6 5.07-6zm-1.08 16.66h1.71L7.63 4.5H5.8l10.65 14.91z" />
    </svg>
  )
}
