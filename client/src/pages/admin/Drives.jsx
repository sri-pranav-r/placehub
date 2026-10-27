import { useState } from 'react';
import { Building2, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { useConfirm, useToast } from '../../context/FeedbackContext';
import { useApi, useMeta } from '../../hooks';
import DataTable from '../../components/DataTable';
import EntityForm from '../../components/EntityForm';
import Modal from '../../components/Modal';
import { Badge, Card, PageHeader } from '../../components/ui';
import { fmtDate, lpa, relativeDays } from '../../utils';

function driveFields(meta, companies) {
  return [
    { name: 'company', label: 'Company', type: 'select', required: true, options: (companies || []).map((c) => [c._id, c.name]) },
    { name: 'role', label: 'Role', required: true, placeholder: 'Software Engineer' },
    { name: 'packageLPA', label: 'Package (LPA)', type: 'number', half: true, step: 0.1, min: 0 },
    { name: 'driveDate', label: 'Drive date', type: 'date', half: true },
    { name: 'minCgpa', label: 'Minimum CGPA', type: 'number', half: true, step: 0.1, min: 0, max: 10, default: 0 },
    { name: 'maxBacklogs', label: 'Max backlogs', type: 'number', half: true, min: 0, default: 0 },
    {
      name: 'branches',
      label: 'Eligible branches',
      type: 'chips',
      options: (meta?.branches || []).map((b) => [b, b]),
      hint: 'Leave all unselected to allow every branch',
    },
    { name: 'status', label: 'Status', type: 'select', half: true, noPlaceholder: true, default: 'upcoming', options: (meta?.driveStatuses || []).map((s) => [s, s]) },
    { name: 'applyLink', label: 'Apply link', type: 'url', half: true, placeholder: 'https://' },
  ];
}

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

export default function Drives() {
  const meta = useMeta();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: drives, loading, reload } = useApi('/drives');
  const { data: companies } = useApi('/companies');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);

  const rows = drives?.filter((d) => filter === 'all' || d.status === filter);

  async function save(body) {
    if (editing._id) await api(`/drives/${editing._id}`, { method: 'PUT', body });
    else await api('/drives', { method: 'POST', body });
    toast(editing._id ? 'Drive updated' : 'Drive created');
    setEditing(null);
    reload();
  }

  async function remove(d) {
    const ok = await confirm({
      title: 'Delete this drive?',
      message: `${d.company?.name} · ${d.role}. All applications to this drive will be deleted too.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/drives/${d._id}`, { method: 'DELETE' });
      toast('Drive deleted');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    {
      label: 'Drive',
      render: (d) => (
        <div className="person">
          <div className="drive-logo sm"><Building2 size={16} /></div>
          <div>
            <strong>{d.role}</strong>
            <span className="muted">
              {d.company?.name}
              {d.source === 'jsearch' && <Badge tone="teal">JSearch</Badge>}
            </span>
          </div>
        </div>
      ),
    },
    { label: 'Package', render: (d) => <strong>{lpa(d.packageLPA)}</strong> },
    {
      label: 'Date',
      render: (d) =>
        d.driveDate ? (
          <div className="stacked">
            <span>{fmtDate(d.driveDate)}</span>
            <span className="muted">{relativeDays(d.driveDate)}</span>
          </div>
        ) : (
          <span className="muted">TBA</span>
        ),
    },
    {
      label: 'Eligibility',
      render: (d) => (
        <div className="stacked">
          <span>CGPA ≥ {d.minCgpa} · ≤ {d.maxBacklogs} backlogs</span>
          <span className="muted">{d.branches.length ? d.branches.join(', ') : 'All branches'}</span>
        </div>
      ),
    },
    { label: 'Status', render: (d) => <Badge>{d.status}</Badge> },
    {
      label: '',
      className: 'actions-col',
      render: (d) => (
        <div className="row-actions">
          {d.applyLink && (
            <a className="icon-btn" title="Apply link" href={d.applyLink} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /></a>
          )}
          <button className="icon-btn" title="Edit" onClick={() => setEditing(d)}><Pencil size={16} /></button>
          <button className="icon-btn danger" title="Delete" onClick={() => remove(d)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Placement drives" subtitle="Schedule drives and set eligibility criteria">
        <button className="btn btn-primary" onClick={() => setEditing({})} disabled={!companies?.length}>
          <Plus size={16} /> New drive
        </button>
      </PageHeader>

      <Card flush>
        <div className="toolbar">
          <div className="segmented">
            {FILTERS.map((f) => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f}
                <span>{f === 'all' ? drives?.length ?? 0 : drives?.filter((d) => d.status === f).length ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} emptyTitle="No drives here" />
      </Card>

      <Modal open={Boolean(editing)} title={editing?._id ? 'Edit drive' : 'New placement drive'} onClose={() => setEditing(null)} size="lg">
        {editing && <EntityForm fields={driveFields(meta, companies)} initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
