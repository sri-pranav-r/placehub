import { useMemo, useState } from 'react';
import { GitMerge, Pencil, Plus, FileSearch, Target, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { useConfirm, useToast } from '../../context/FeedbackContext';
import { useApi, useMeta } from '../../hooks';
import DataTable from '../../components/DataTable';
import EntityForm from '../../components/EntityForm';
import EligibleDrives from '../../components/EligibleDrives';
import Modal from '../../components/Modal';
import ResumeReview from '../../components/ResumeReview';
import { Avatar, Badge, Card, Chips, PageHeader, SearchInput, Spinner } from '../../components/ui';

function studentFields(meta) {
  return [
    { name: 'usn', label: 'USN', required: true, half: true, placeholder: '1RV23CS001' },
    { name: 'name', label: 'Full name', required: true, half: true },
    { name: 'email', label: 'Email', type: 'email', required: true, half: true },
    { name: 'phone', label: 'Phone', half: true },
    { name: 'branch', label: 'Branch', type: 'select', required: true, half: true, options: (meta?.branches || []).map((b) => [b, b]) },
    { name: 'gradYear', label: 'Graduation year', type: 'number', half: true, min: 2000, max: 2100 },
    { name: 'cgpa', label: 'CGPA', type: 'number', required: true, half: true, step: 0.01, min: 0, max: 10 },
    { name: 'backlogs', label: 'Backlogs', type: 'number', half: true, min: 0, default: 0 },
    { name: 'skills', label: 'Skills', type: 'csv', placeholder: 'Java, React, SQL', hint: 'Comma separated' },
    { name: 'resumeText', label: 'Resume text', type: 'textarea', rows: 5, hint: 'Used for the AI resume review' },
  ];
}

// Find same-email duplicates and merge two student records
function MergePanel({ students, onMerged }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data: dupes, loading } = useApi('/reports/duplicates');
  const [keepId, setKeepId] = useState('');
  const [removeId, setRemoveId] = useState('');
  const byId = (id) => students.find((s) => s._id === id);

  async function merge() {
    const keep = byId(keepId);
    const dup = byId(removeId);
    const ok = await confirm({
      title: 'Merge students?',
      message: `${dup.usn} will be merged into ${keep.usn} and then deleted. Skills, missing details and applications move to ${keep.usn}.`,
      confirmLabel: 'Merge',
      danger: true,
    });
    if (!ok) return;
    try {
      const r = await api('/students/merge', { method: 'POST', body: { keepId, removeId } });
      toast(`${r.message}: ${r.applicationsMoved} applications moved, ${r.applicationsCombined} combined`);
      onMerged();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="stack">
      <div>
        <h3 className="subhead">Suggested duplicates (same email)</h3>
        {loading ? (
          <Spinner />
        ) : dupes?.length ? (
          <ul className="dupe-list">
            {dupes.map((g) => (
              <li key={g._id}>
                <div>
                  <strong>{g.students[0].name}</strong>
                  <span className="muted">{g._id}</span>
                  <div className="chips">{g.students.map((s) => <span key={s._id} className="chip">{s.usn}</span>)}</div>
                </div>
                <button className="btn btn-soft btn-sm" onClick={() => { setKeepId(g.students[0]._id); setRemoveId(g.students[1]._id); }}>
                  Select
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No duplicates found.</p>
        )}
      </div>
      <div className="form-grid">
        <div className="field half">
          <label>Keep this record</label>
          <select value={keepId} onChange={(e) => setKeepId(e.target.value)}>
            <option value="">Select…</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.usn} · {s.name}</option>)}
          </select>
        </div>
        <div className="field half">
          <label>Merge &amp; remove</label>
          <select value={removeId} onChange={(e) => setRemoveId(e.target.value)}>
            <option value="">Select…</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.usn} · {s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-primary" disabled={!keepId || !removeId || keepId === removeId} onClick={merge}>
          <GitMerge size={16} /> Merge records
        </button>
      </div>
    </div>
  );
}

function EligibleModal({ student, onClose, onChange }) {
  const toast = useToast();
  const { data, loading, reload } = useApi(`/reports/eligible/${student._id}`);
  async function apply(driveId) {
    try {
      await api('/applications', { method: 'POST', body: { student: student._id, drive: driveId } });
      toast(`Applied ${student.name} to the drive`);
      reload();
      onChange();
    } catch (err) {
      toast(err.message, 'error');
    }
  }
  return (
    <Modal open title={`Eligible drives for ${student.name}`} subtitle={`${student.branch} · CGPA ${student.cgpa} · ${student.backlogs} backlogs · matched with $lookup`} onClose={onClose} size="lg">
      {loading && !data ? <Spinner /> : <EligibleDrives data={data} onApply={apply} />}
    </Modal>
  );
}

export default function Students() {
  const meta = useMeta();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: students, loading, reload } = useApi('/students');
  const { data: drives } = useApi('/drives');
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [placed, setPlaced] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, doc = edit
  const [modal, setModal] = useState(null); // { type: 'eligible' | 'review' | 'merge', student }

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return (students || []).filter(
      (s) =>
        (!q || `${s.name} ${s.usn} ${s.email} ${s.skills.join(' ')}`.toLowerCase().includes(q)) &&
        (!branch || s.branch === branch) &&
        (!placed || String(s.placed) === placed)
    );
  }, [students, search, branch, placed]);

  async function save(body) {
    if (editing._id) await api(`/students/${editing._id}`, { method: 'PUT', body });
    else await api('/students', { method: 'POST', body });
    toast(editing._id ? 'Student updated' : 'Student added');
    setEditing(null);
    reload();
  }

  async function remove(s) {
    const ok = await confirm({
      title: `Delete ${s.name}?`,
      message: 'Their applications and login account will be deleted too. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/students/${s._id}`, { method: 'DELETE' });
      toast('Student deleted');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    {
      label: 'Student',
      render: (s) => (
        <div className="person">
          <Avatar name={s.name} />
          <div>
            <strong>{s.name}</strong>
            <span className="muted">{s.email}</span>
          </div>
        </div>
      ),
    },
    {
      label: 'USN / Branch',
      render: (s) => (
        <div className="stacked">
          <code>{s.usn}</code>
          <span className="muted">{s.branch}</span>
        </div>
      ),
    },
    {
      label: 'CGPA',
      render: (s) => (
        <div className="stacked">
          <strong>{s.cgpa}</strong>
          {s.backlogs > 0 ? <span className="text-red">{s.backlogs} backlog{s.backlogs > 1 ? 's' : ''}</span> : <span className="muted">no backlogs</span>}
        </div>
      ),
    },
    { label: 'Skills', render: (s) => <Chips items={s.skills} max={2} /> },
    { label: 'Status', render: (s) => <Badge>{s.placed ? 'placed' : 'not placed'}</Badge> },
    {
      label: '',
      className: 'actions-col',
      render: (s) => (
        <div className="row-actions">
          <button className="icon-btn" title="Eligible drives" onClick={() => setModal({ type: 'eligible', student: s })}><Target size={16} /></button>
          <button className="icon-btn" title="Resume review" onClick={() => setModal({ type: 'review', student: s })}><FileSearch size={16} /></button>
          <button className="icon-btn" title="Edit" onClick={() => setEditing(s)}><Pencil size={16} /></button>
          <button className="icon-btn danger" title="Delete" onClick={() => remove(s)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Students" subtitle={students ? `${students.length} registered students` : ' '}>
        <button className="btn btn-outline" onClick={() => setModal({ type: 'merge' })}>
          <GitMerge size={16} /> Merge duplicates
        </button>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Plus size={16} /> Add student
        </button>
      </PageHeader>

      <Card flush>
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, USN, email or skill…" />
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">All branches</option>
            {meta?.branches.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={placed} onChange={(e) => setPlaced(e.target.value)}>
            <option value="">All statuses</option>
            <option value="true">Placed</option>
            <option value="false">Not placed</option>
          </select>
        </div>
        <DataTable columns={columns} rows={students && rows} loading={loading} emptyTitle="No students match" />
      </Card>

      <Modal open={Boolean(editing)} title={editing?._id ? `Edit ${editing.name}` : 'Add student'} onClose={() => setEditing(null)} size="lg">
        {editing && <EntityForm fields={studentFields(meta)} initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>

      {modal?.type === 'eligible' && <EligibleModal student={modal.student} onClose={() => setModal(null)} onChange={reload} />}

      <Modal open={modal?.type === 'review'} title={`Resume review for ${modal?.student?.name}`} subtitle="Sends this student's resume and academic summary to Google Gemini" onClose={() => setModal(null)} size="lg">
        {modal?.type === 'review' && (
          <ResumeReview endpoint={`/external/resume-review/${modal.student._id}`} drives={drives || []} hasResume={Boolean(modal.student.resumeText)} />
        )}
      </Modal>

      <Modal open={modal?.type === 'merge'} title="Merge duplicate students" subtitle="Combine two records of the same student into one" onClose={() => setModal(null)} size="lg">
        {modal?.type === 'merge' && (
          <MergePanel students={students || []} onMerged={() => { setModal(null); reload(); }} />
        )}
      </Modal>
    </>
  );
}
