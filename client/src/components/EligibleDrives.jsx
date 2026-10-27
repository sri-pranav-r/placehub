import { useState } from 'react';
import { Building2, CalendarDays, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Badge, EmptyState } from './ui';
import { fmtDate, lpa, relativeDays } from '../utils';

// List of drives from the $lookup eligibility query, with an Apply button on each.
export default function EligibleDrives({ data, onApply }) {
  const [busyId, setBusyId] = useState(null);
  if (!data) return null;
  const applied = new Set(data.appliedDriveIds.map(String));

  if (!data.eligibleDrives.length) {
    return <EmptyState title="No open drives match yet">New drives will show up here as soon as you're eligible.</EmptyState>;
  }

  async function apply(id) {
    setBusyId(id);
    try {
      await onApply(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ul className="drive-list">
      {data.eligibleDrives.map((d) => (
        <li key={d._id} className="drive-item">
          <div className="drive-logo"><Building2 size={18} /></div>
          <div className="drive-info">
            <strong>{d.role}</strong>
            <span className="muted">{d.company.name}{d.company.location ? ` · ${d.company.location}` : ''}</span>
            <div className="drive-tags">
              <span className="tag-package">{lpa(d.packageLPA)}</span>
              {d.driveDate && (
                <span className="tag-date"><CalendarDays size={13} /> {fmtDate(d.driveDate)} · {relativeDays(d.driveDate)}</span>
              )}
              <Badge>{d.status}</Badge>
            </div>
          </div>
          {applied.has(String(d._id)) ? (
            <span className="badge badge-green"><CheckCircle2 size={14} /> Applied</span>
          ) : (
            <button className="btn btn-primary btn-sm" disabled={busyId === d._id} onClick={() => apply(d._id)}>
              {busyId === d._id ? <Loader2 size={14} className="spin" /> : <Send size={14} />} Apply
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
