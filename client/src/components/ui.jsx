import { Inbox, Loader2 } from 'lucide-react';
import { initials } from '../utils';

const STATUS_TONE = {
  applied: 'blue',
  shortlisted: 'teal',
  interview: 'amber',
  offered: 'green',
  rejected: 'red',
  upcoming: 'blue',
  ongoing: 'amber',
  completed: 'gray',
  placed: 'green',
  'not placed': 'gray',
};

export function Badge({ children, tone }) {
  const t = tone || STATUS_TONE[String(children).toLowerCase()] || 'gray';
  return <span className={`badge badge-${t}`}>{children}</span>;
}

export function Spinner({ label }) {
  return (
    <div className="spinner">
      <Loader2 size={20} className="spin" />
      {label && <span>{label}</span>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className = '', flush }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? '' : 'card-body'}>{children}</div>
    </section>
  );
}

// Flat, muted avatar colours (picked per name so each person keeps the same one)
const AVATAR_COLOURS = ['#1d4ed8', '#0f766e', '#047857', '#b45309', '#be123c', '#475569', '#0e7490', '#4d7c0f'];

export function Avatar({ name, size = 36 }) {
  const index = [...(name || '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 0) % AVATAR_COLOURS.length;
  return (
    <span className="avatar" style={{ width: size, height: size, background: AVATAR_COLOURS[index], fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  );
}

export function Chips({ items = [], max = 3 }) {
  if (!items.length) return <span className="muted">-</span>;
  return (
    <div className="chips">
      {items.slice(0, max).map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
      {items.length > max && <span className="chip chip-more">+{items.length - max}</span>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-input">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
