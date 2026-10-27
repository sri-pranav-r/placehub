import { Link } from 'react-router-dom';
import { SITE } from '../site';

// Logo mark (the team's design): navy square, white "P" with a lime magnifier tail
export function LogoMark({ size = 30 }) {
  return (
    <svg className="logo-mark" viewBox="0 0 36 36" width={size} height={size} aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#111E2D" />
      <path d="M11 26V10h8.2a6 6 0 0 1 0 12H15" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m22 22 4 4" fill="none" stroke="#D7F773" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label={`${SITE.name} home`}>
      <LogoMark />
      {SITE.name}
    </Link>
  );
}
