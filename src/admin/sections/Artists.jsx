import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import { listAllArtworks } from '../../services/admin';
import { Loading, useLoad } from '../ui';

export default function Artists() {
  const { data, error } = useLoad(listAllArtworks);
  const map = new Map();
  (data || []).forEach((a) => {
    const e = map.get(a.artistId) || { id: a.artistId, name: a.artistName, total: 0, approved: 0, pending: 0 };
    e.total += 1;
    if (a.status === 'approved') e.approved += 1;
    if (a.status === 'pending') e.pending += 1;
    map.set(a.artistId, e);
  });
  const rows = [...map.values()].sort((a, b) => b.total - a.total);
  return (
    <Loading data={data} error={error}>
      {rows.length === 0 ? (
        <EmptyState title="No artists yet" text="Members who upload artwork appear here." />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 p-4">
              <p className="font-display text-lg font-bold">{r.name}</p>
              <p className="text-sm text-muted">{r.total} works · {r.approved} approved · {r.pending} pending</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">Manage accounts in <Link to="/admin?tab=users" className="underline hover:text-neon">Users</Link>.</p>
    </Loading>
  );
}
