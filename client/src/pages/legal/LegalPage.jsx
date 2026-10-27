import { useEffect } from 'react';
import { SITE } from '../../site';

// Shows a configured site value, or a highlighted marker in development if it is not set yet.
// (Production builds cannot reach this state: vite.config.js blocks the build.)
export function SiteValue({ field, envName }) {
  const value = SITE[field];
  if (value) return field === 'contactEmail' ? <a href={`mailto:${value}`}>{value}</a> : value;
  return <span className="placeholder">not set: {envName}</span>;
}

export default function LegalPage({ title, children }) {
  useEffect(() => {
    document.title = `${title} | ${SITE.name}`;
    window.scrollTo(0, 0);
    return () => {
      document.title = SITE.name;
    };
  }, [title]);

  return (
    <main className="legal">
      <div className="container">
        <h1>{title}</h1>
        <p className="updated">Last updated: {SITE.policiesUpdated}</p>
        {children}
      </div>
    </main>
  );
}
