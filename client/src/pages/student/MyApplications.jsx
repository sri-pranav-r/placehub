import { Building2, FileText, Undo2 } from 'lucide-react';
import { api } from '../../api';
import { useConfirm, useToast } from '../../context/FeedbackContext';
import { Badge, EmptyState } from '../../components/ui';
import { fmtDate, lpa } from '../../utils';

const STEPS = ['applied', 'shortlisted', 'interview', 'offered'];

// Progress dots: applied → shortlisted → interview → offered
function Progress({ status }) {
  const reached = STEPS.indexOf(status);
  return (
    <div className={`progress-steps ${status === 'rejected' ? 'is-rejected' : ''}`}>
      {STEPS.map((s, i) => (
        <span key={s} className={i <= reached ? 'done' : ''} title={s} />
      ))}
    </div>
  );
}

export default function MyApplications({ apps, onChange }) {
  const toast = useToast();
  const confirm = useConfirm();

  if (!apps?.length) {
    return <EmptyState icon={FileText} title="No applications yet">Apply to an eligible drive to get started.</EmptyState>;
  }

  async function withdraw(app) {
    const ok = await confirm({
      title: 'Withdraw application?',
      message: `${app.drive?.company?.name} · ${app.drive?.role}`,
      confirmLabel: 'Withdraw',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/me/applications/${app._id}`, { method: 'DELETE' });
      toast('Application withdrawn');
      onChange();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <ul className="drive-list">
      {apps.map((a) => (
        <li key={a._id} className="drive-item">
          <div className="drive-logo"><Building2 size={18} /></div>
          <div className="drive-info">
            <strong>{a.drive?.role}</strong>
            <span className="muted">{a.drive?.company?.name} · {lpa(a.drive?.packageLPA)} · applied {fmtDate(a.createdAt)}</span>
            <Progress status={a.status} />
          </div>
          <div className="drive-side">
            <Badge>{a.status}</Badge>
            {a.status === 'applied' && (
              <button className="btn btn-ghost btn-sm" onClick={() => withdraw(a)}>
                <Undo2 size={14} /> Withdraw
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
