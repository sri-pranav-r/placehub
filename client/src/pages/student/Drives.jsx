import { useMemo } from 'react';
import { Building2, Lock } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../context/FeedbackContext';
import { useApi } from '../../hooks';
import DataTable from '../../components/DataTable';
import EligibleDrives from '../../components/EligibleDrives';
import { Badge, Card, PageHeader, Spinner } from '../../components/ui';
import { fmtDate, lpa } from '../../utils';

export default function StudentDrives() {
  const toast = useToast();
  const eligible = useApi('/me/eligible');
  const { data: allDrives, loading } = useApi('/drives');

  // Drives the student can't apply to, with the reason
  const others = useMemo(() => {
    if (!eligible.data || !allDrives) return null;
    const ok = new Set(eligible.data.eligibleDrives.map((d) => d._id));
    const s = eligible.data;
    return allDrives
      .filter((d) => !ok.has(d._id))
      .map((d) => {
        const reasons = [];
        if (d.status === 'completed') reasons.push('Drive completed');
        if (s.cgpa < d.minCgpa) reasons.push(`Needs CGPA ${d.minCgpa}`);
        if (s.backlogs > d.maxBacklogs) reasons.push(`Max ${d.maxBacklogs} backlogs`);
        if (d.branches.length && !d.branches.includes(s.branch)) reasons.push(`Only ${d.branches.join(', ')}`);
        return { ...d, reasons };
      });
  }, [eligible.data, allDrives]);

  async function apply(driveId) {
    try {
      await api('/me/applications', { method: 'POST', body: { drive: driveId } });
      toast('Application submitted');
      eligible.reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const columns = [
    {
      label: 'Drive',
      render: (d) => (
        <div className="person">
          <div className="drive-logo sm muted-logo"><Building2 size={16} /></div>
          <div>
            <strong>{d.role}</strong>
            <span className="muted">{d.company?.name}</span>
          </div>
        </div>
      ),
    },
    { label: 'Package', render: (d) => lpa(d.packageLPA) },
    { label: 'Date', render: (d) => fmtDate(d.driveDate) },
    { label: 'Status', render: (d) => <Badge>{d.status}</Badge> },
    {
      label: 'Why not eligible',
      render: (d) => (
        <div className="chips">
          {d.reasons.map((r) => <span key={r} className="chip chip-red"><Lock size={11} /> {r}</span>)}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Placement drives" subtitle="Apply to drives that match your profile" />
      <Card title="Eligible for you" subtitle="Found with a MongoDB $lookup on your CGPA, backlogs and branch">
        {eligible.loading && !eligible.data ? <Spinner /> : <EligibleDrives data={eligible.data} onApply={apply} />}
      </Card>
      <Card title="Other drives" subtitle="Drives you can't apply to right now" flush>
        <DataTable columns={columns} rows={others} loading={loading || eligible.loading} emptyTitle="You are eligible for every open drive" />
      </Card>
    </>
  );
}
