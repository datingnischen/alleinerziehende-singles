/* Linien-Symbole für alle Seitentypen (24er-Raster, Strichstärke 1.8, currentColor). */

type IconProps = { className?: string };

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...STROKE}>{children}</svg>;
}

export function HeartIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 20s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.1-8 11-8 11Z" /></Svg>;
}

/** Herz mit Kind wie im Logo: Markenzeichen für Badges und Karten. */
export function FamilyHeartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 21.2s-8.6-5.2-8.6-11.6A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.6 3.2c0 6.4-8.6 11.6-8.6 11.6Z" />
      <circle cx="15.6" cy="9.4" r="1.7" fill="#fff" opacity=".9" />
      <path fill="#fff" opacity=".9" d="M13.9 12.2c0-.8.7-1.3 1.7-1.3s1.7.5 1.7 1.3v3.6h-3.4Z" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>;
}

export function ClockIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
}

export function RouteIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" /></Svg>;
}

/** Hand hält Herz: Unterstützung, Beratung, Anlaufstellen */
export function SupportIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M3 15.5h3.5l3.6 2.4c.7.5 1.6.5 2.3 0l6.4-4.2a1.5 1.5 0 0 0-1.6-2.5l-3.7 2" /><path d="M6.5 15.5 9 12.8a2.5 2.5 0 0 1 1.8-.8H14" /><path d="M14.5 8.2S12 6.7 12 4.9A1.5 1.5 0 0 1 14.5 4a1.5 1.5 0 0 1 2.5.9c0 1.8-2.5 3.3-2.5 3.3Z" /></Svg>;
}

/** Bauklötze: Kinderbetreuung, Kita, Bildung */
export function BlocksIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="3.5" y="12.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="12.5" width="7" height="7" rx="1.2" /><path d="M12 3.5 16 10H8Z" /></Svg>;
}

export function SchoolIcon({ className }: IconProps) {
  return <Svg className={className}><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5Z" /><path d="M6.5 11v4.5c1.4 1.4 3.3 2 5.5 2s4.1-.6 5.5-2V11" /><path d="M21.5 9v5" /></Svg>;
}

export function HomeIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M4 10.5 12 4l8 6.5V20H4Z" /><path d="M10 20v-5.5h4V20" /></Svg>;
}

export function CoinIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="8.5" /><path d="M15 8.8A3.6 3.6 0 0 0 12.4 8c-2.3 0-3.9 1.8-3.9 4s1.6 4 3.9 4c1 0 1.9-.3 2.6-.8M7 11h5M7 13.2h5" /></Svg>;
}

export function BalloonIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 14.5c-3 0-5.5-3-5.5-6.3A5.5 5.5 0 0 1 12 3a5.5 5.5 0 0 1 5.5 5.2c0 3.3-2.5 6.3-5.5 6.3Z" /><path d="m11 14.4-.6 1.4h3.2l-.6-1.4M12 15.8c0 2-2 2.2-2 4.2" /></Svg>;
}

export function TreeIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 21v-5" /><path d="M12 3c-3 0-5.5 2.4-5.5 5.3-1.4.8-2.3 2.2-2.3 3.8 0 2.4 2.1 4 4.6 4h6.4c2.5 0 4.6-1.6 4.6-4 0-1.6-.9-3-2.3-3.8C17.5 5.4 15 3 12 3Z" /></Svg>;
}

export function UsersIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="9" cy="8" r="3.2" /><path d="M3 19.5c.4-3.2 2.8-5.2 6-5.2s5.6 2 6 5.2" /><path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2M17.5 14.6c2 .6 3.3 2.3 3.5 4.9" /></Svg>;
}

export function BriefcaseIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" /></Svg>;
}

export function ScaleIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 4v16M7 20h10M5 7h14M12 4l-1 3" /><path d="m5 7-2.5 6a3 3 0 0 0 5 0Zm14 0-2.5 6a3 3 0 0 0 5 0Z" /></Svg>;
}

export function HealthIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 20s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.1-8 11-8 11Z" /><path d="M8 11.5h2.2l1.3-2.5 2 5 1.3-2.5H16" /></Svg>;
}

export function ChatIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M20 12a7.5 7.5 0 0 1-11 6.6L4 20l1.4-4.4A7.5 7.5 0 1 1 20 12Z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></Svg>;
}

export function SparkIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 3.5 13.8 9l5.7 1.5-5.7 1.7L12 18l-1.8-5.8-5.7-1.7L10.2 9Z" /><path d="M19 3v3M17.5 4.5h3M5 17v3M3.5 18.5h3" /></Svg>;
}

export function CompassIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></Svg>;
}

export function ShieldIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6Z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></Svg>;
}

export function StarIcon({ className }: IconProps) {
  return <Svg className={className}><path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z" /></Svg>;
}

export function TagIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M3.5 12V4.5h7.5l9 9-7.5 7.5Z" /><circle cx="8" cy="9" r="1.4" /></Svg>;
}

export function PhoneIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>;
}

export function UserIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.6-4 3.6-6.5 7.5-6.5s6.9 2.5 7.5 6.5" /></Svg>;
}

export function EyeIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Svg>;
}

export function SearchIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></Svg>;
}

export function BookIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" /><path d="M12 6.5v13" /></Svg>;
}

export function CalendarIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
}

export function MailIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></Svg>;
}

export function QuestionIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5M12 16.8h.01" /></Svg>;
}

export function ArrowIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
}

export function CheckIcon({ className }: IconProps) {
  return <Svg className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
}

export function MenuIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
}

export function CloseIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
}

export function CameraIcon({ className }: IconProps) {
  return <Svg className={className}><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.5" /></Svg>;
}

export function VideoIcon({ className }: IconProps) {
  return <Svg className={className}><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="m16 11 5-3v8l-5-3" /></Svg>;
}

export function SunIcon({ className }: IconProps) {
  return <Svg className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg>;
}
