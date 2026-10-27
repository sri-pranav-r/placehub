import { Link } from 'react-router-dom';
import { SITE } from '../site';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" width="17" height="17" aria-hidden="true">
          <path d="M10 25V7h7.5a5.5 5.5 0 0 1 0 11H10" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {SITE.name}
    </Link>
  );
}
