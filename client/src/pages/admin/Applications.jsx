import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { useConfirm, useToast } from '../../context/FeedbackContext';
import { useApi, useMeta } from '../../hooks';
import DataTable from '../../components/DataTable';
import EntityForm from '../../components/EntityForm';
import Modal from '../../components/Modal';
import { Avatar, Card, PageHeader, SearchInput } from '../../components/ui';
import { fmtDate, lpa } from '../../utils';

export default function Applications() {
  const meta = useMeta();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: apps, loading, reload } = useApi('/applications');
  const { data: students } = useApi('/students');
  const { data: drives } = useApi('/drives');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);

  const counts = useMemo(() => {
    const c = { all: apps?.length || 0 };
    for (const a of apps || []) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [apps]);

  const rows = apps?.filter((a) => {
    const q = search.toLowerCase();
    const text = `${a.student?.name} ${a.student?.usn} ${a.drive?.company?.name} ${a.drive?.role}`.toLowerCase();
    return (status === 'all' || a.status === status) && (!q || text.includes(q));
  });

  async function changeStatus(app, newStatus) {
    try {
      await api(`/applications/${app._id}`, { method: 'PUT', body: { status: newStatus } });
      toast(`${app.student?.name}: ${newStatus}`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(app) {
    const ok = await confirm({
      title: 'Delete application?',
      message: `${app.student?.name} → ${app.drive?.company?.name} (${app.drive?.role})`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/applications/${app._id}`, { method: 'DELETE' });
      toast('Application deleted');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function create(body) {
    await api('/applications', { method: 'POST', body });
    toast('Application created');
    setAdding(false);
    reload();
  }

  const fields = [
    { name: 'student', label: 'Student', type: 'select', required: true, options: (students || []).map((s) => [s._id, `${s.usn} · ${s.name}`]) },
    { name: 'drive', label: 'Drive', type: 'select', required: true, options: (drives || []).map((d) => [d._id, `${d.company?.name} · ${d.role}`]) },
    { name: 'status', label: 'Status', type: 'select', half: true, noPlaceholder: true, default: 'applied', options: (meta?.applicationStatuses || []).map((s) => [s, s]) },
    { name: 'remarks', label: 'Remarks', half: true },
  ];

  const columns = [
    {
      label: 'Student',
      render: (a) => (
        <div className="person">
          <Avatar name={a.student?.name} size={32} />
          <div>
            <strong>{a.student?.name}</strong>
            <span className="muted">{a.student?.usn} · {a.student?.branch}</span>
          </div>
        </div>
      ),
    },
    {
      label: 'Company / role',
      render: (a) => (
        <div className="stacked">
          <strong>{a.drive?.company?.name}</strong>
          <span className="muted">{a.drive?.role}</span>
        </div>
      ),
    },
    { label: 'Package', render: (a) => lpa(a.drive?.packageLPA) },
    {
      label: 'Status',
      render: (a) => (
        <select className={`status-select status-${a.status}`} value={a.status} onChange={(e) => changeStatus(a, e.target.value)}>
          {meta?.applicationStatuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      ),
    },
    { label: 'Applied', render: (a) => <span className="muted">{fmtDate(a.createdAt)}</span> },
    {
      label: '',
      className: 'actions-col',
      render: (a) => (
        <button className="icon-btn danger" title="Delete" onClick={() => remove(a)}><Trash2 size={16} /></button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Applications" subtitle="Update the status of each application">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} /> New application
        </button>
      </PageHeader>

      <Card flush>
        <div className="toolbar">
          <div className="segmented">
            {['all', ...(meta?.applicationStatuses || [])].map((s) => (
              <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>
                {s}
                <span>{counts[s] || 0}</span>
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search student or company…" />
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} emptyTitle="No applications here" />
      </Card>

      <Modal open={adding} title="New application" subtitle="Eligibility is checked by the server before saving" onClose={() => setAdding(false)}>
        {adding && <EntityForm fields={fields} initial={null} onSubmit={create} onCancel={() => setAdding(false)} submitLabel="Create application" />}
      </Modal>
    </>
  );
}
