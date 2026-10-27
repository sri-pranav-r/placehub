import { useMemo, useState } from 'react';
import { Building2, ExternalLink, Mail, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { useConfirm, useToast } from '../../context/FeedbackContext';
import { useApi } from '../../hooks';
import EntityForm from '../../components/EntityForm';
import Modal from '../../components/Modal';
import { Badge, EmptyState, PageHeader, SearchInput, Spinner } from '../../components/ui';

const FIELDS = [
  { name: 'name', label: 'Company name', required: true },
  { name: 'sector', label: 'Sector', half: true, placeholder: 'Product, Service, Core…' },
  { name: 'location', label: 'Location', half: true },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
  { name: 'hrEmail', label: 'HR email', type: 'email' },
];

export default function Companies() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: companies, loading, reload } = useApi('/companies');
  const { data: drives } = useApi('/drives');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const driveCount = useMemo(() => {
    const counts = {};
    for (const d of drives || []) counts[d.company?._id] = (counts[d.company?._id] || 0) + 1;
    return counts;
  }, [drives]);

  const rows = (companies || []).filter((c) =>
    `${c.name} ${c.sector} ${c.location}`.toLowerCase().includes(search.toLowerCase())
  );

  async function save(body) {
    if (editing._id) await api(`/companies/${editing._id}`, { method: 'PUT', body });
    else await api('/companies', { method: 'POST', body });
    toast(editing._id ? 'Company updated' : 'Company added');
    setEditing(null);
    reload();
  }

  async function remove(c) {
    const ok = await confirm({
      title: `Delete ${c.name}?`,
      message: `This also deletes its ${driveCount[c._id] || 0} drive(s) and every application to them.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/companies/${c._id}`, { method: 'DELETE' });
      toast('Company deleted');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Companies" subtitle={companies ? `${companies.length} recruiters` : ' '}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search companies…" />
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Plus size={16} /> Add company
        </button>
      </PageHeader>

      {loading && !companies ? (
        <Spinner />
      ) : rows.length ? (
        <div className="company-grid">
          {rows.map((c) => (
            <article key={c._id} className="company-card">
              <div className="company-top">
                <div className="company-logo">{c.name[0]}</div>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(c)}><Pencil size={16} /></button>
                  <button className="icon-btn danger" title="Delete" onClick={() => remove(c)}><Trash2 size={16} /></button>
                </div>
              </div>
              <h3>{c.name}</h3>
              <div className="company-meta">
                {c.sector && <Badge tone="blue">{c.sector}</Badge>}
                <Badge tone="gray">{driveCount[c._id] || 0} drives</Badge>
              </div>
              <ul className="company-details">
                {c.location && <li><MapPin size={14} /> {c.location}</li>}
                {c.hrEmail && <li><Mail size={14} /> {c.hrEmail}</li>}
                {c.website && (
                  <li>
                    <ExternalLink size={14} />
                    <a href={c.website} target="_blank" rel="noopener noreferrer">{c.website.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </li>
                )}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="No companies yet" action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add company</button>} />
      )}

      <Modal open={Boolean(editing)} title={editing?._id ? `Edit ${editing.name}` : 'Add company'} onClose={() => setEditing(null)}>
        {editing && <EntityForm fields={FIELDS} initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
