import { EmptyState, Spinner } from './ui';

// columns: [{ label, render(row), className? }]
export default function DataTable({ columns, rows, loading, emptyTitle = 'Nothing here yet', emptyText, rowKey = (r) => r._id }) {
  if (loading && !rows) return <Spinner label="Loading…" />;
  if (!rows?.length) return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.className}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c, i) => (
                <td key={i} className={c.className} data-label={c.label}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
