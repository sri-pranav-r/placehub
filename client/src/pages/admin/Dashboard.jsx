import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Briefcase, Building2, CalendarDays, GraduationCap, Loader2, RefreshCw, Trophy, Users } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../context/FeedbackContext';
import { useApi } from '../../hooks';
import DataTable from '../../components/DataTable';
import { Badge, Card, EmptyState, PageHeader, Spinner, StatCard } from '../../components/ui';
import { fmtDate, fmtDateTime, lpa, relativeDays } from '../../utils';

const PIPELINE = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];

// A report backed by a $merge collection, with a button to re-run the aggregation
function MergeReport({ kind, title, subtitle, columns }) {
  const toast = useToast();
  const { data, loading, reload } = useApi(`/reports/${kind}`);
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const list = rows ?? data;

  async function refresh() {
    setBusy(true);
    try {
      const result = await api(`/reports/${kind}/refresh`, { method: 'POST' });
      setRows(result);
      toast(`$merge wrote ${result.length} documents`);
    } catch (err) {
      toast(err.message, 'error');
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title={title}
      subtitle={list?.length ? `${subtitle} · updated ${fmtDateTime(list[0].refreshedAt)}` : subtitle}
      actions={
        <button className="btn btn-soft btn-sm" onClick={refresh} disabled={busy}>
          {busy ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Run $merge
        </button>
      }
      flush
    >
      {loading && !list ? (
        <Spinner />
      ) : list?.length ? (
        <DataTable columns={columns} rows={list} />
      ) : (
        <EmptyState title="Report not generated yet">Click “Run $merge” to build it from live data.</EmptyState>
      )}
    </Card>
  );
}

const BRANCH_COLUMNS = [
  { label: 'Branch', render: (r) => <strong>{r.branch}</strong> },
  { label: 'Students', render: (r) => r.totalStudents },
  { label: 'Placed', render: (r) => r.placed },
  { label: 'Avg CGPA', render: (r) => r.avgCgpa },
  {
    label: 'Placement rate',
    className: 'w-40',
    render: (r) => (
      <div className="progress-row">
        <div className="progress"><span style={{ width: `${r.placementPct}%` }} /></div>
        <span>{r.placementPct}%</span>
      </div>
    ),
  },
];

const COMPANY_COLUMNS = [
  { label: 'Company', render: (r) => <strong>{r.companyName}</strong> },
  { label: 'Sector', render: (r) => r.sector || '-' },
  { label: 'Applications', render: (r) => r.totalApplications },
  { label: 'Offers', render: (r) => r.offers },
  { label: 'Conversion', render: (r) => `${r.conversionRate}%` },
  { label: 'Avg / Max package', render: (r) => (r.offers ? `${r.avgPackageLPA} / ${r.maxPackageLPA} LPA` : '-') },
];

export default function Dashboard() {
  const { data: o, loading, error, reload } = useApi('/reports/overview');

  if (loading && !o) return <Spinner label="Loading dashboard…" />;
  if (!o) {
    return (
      <div className="alert alert-error">
        Could not load the dashboard: {error}.{' '}
        <button className="btn btn-sm btn-outline" onClick={reload}>Try again</button>
      </div>
    );
  }

  const placedPct = o.students ? Math.round((o.placed / o.students) * 100) : 0;
  const maxStatus = Math.max(1, ...PIPELINE.map((s) => o.statusCounts[s] || 0));

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Current figures from the database" />

      <div className="stat-grid">
        <StatCard icon={Users} label="Students" value={o.students} hint={`${o.placed} placed`} />
        <StatCard icon={GraduationCap} label="Placement rate" value={`${placedPct}%`} tone="green" hint={`${o.offers} offers made`} />
        <StatCard icon={Trophy} label="Highest package" value={lpa(o.highestPackage?.lpa)} tone="amber" hint={o.highestPackage?.company} />
        <StatCard icon={Briefcase} label="Drives" value={o.drives} tone="teal" hint={`${o.companies} companies`} />
      </div>

      <div className="grid-2">
        <Card title="Application pipeline" subtitle={`${o.applications} applications in total`}>
          <div className="pipeline">
            {PIPELINE.map((s) => (
              <div key={s} className="pipeline-row">
                <Badge>{s}</Badge>
                <div className={`pipeline-bar bar-${s}`}>
                  <span style={{ width: `${((o.statusCounts[s] || 0) / maxStatus) * 100}%` }} />
                </div>
                <strong>{o.statusCounts[s] || 0}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Upcoming drives"
          actions={<Link to="/admin/drives" className="link">View all <ArrowRight size={14} /></Link>}
        >
          {o.upcomingDrives.length ? (
            <ul className="mini-list">
              {o.upcomingDrives.map((d) => (
                <li key={d._id}>
                  <div className="mini-icon"><Building2 size={16} /></div>
                  <div>
                    <strong>{d.company?.name}</strong>
                    <span className="muted">{d.role}</span>
                  </div>
                  <div className="mini-right">
                    <span>{lpa(d.packageLPA)}</span>
                    <span className="muted"><CalendarDays size={12} /> {d.driveDate ? `${fmtDate(d.driveDate)} · ${relativeDays(d.driveDate)}` : 'TBA'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Award} title="No upcoming drives" />
          )}
        </Card>
      </div>

      <MergeReport
        kind="branch-stats"
        title="Branch-wise placements"
        subtitle="$group students → $merge into branchstats"
        columns={BRANCH_COLUMNS}
      />
      <MergeReport
        kind="company-stats"
        title="Company-wise results"
        subtitle="$lookup applications → drives → companies, $group, $merge into placementstats"
        columns={COMPANY_COLUMNS}
      />
    </>
  );
}
