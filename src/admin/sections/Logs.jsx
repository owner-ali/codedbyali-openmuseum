import EmptyState from '../../components/common/EmptyState';
import { listLogs } from '../../services/admin';
import { Loading, useLoad } from '../ui';

export default function Logs() {
  const { data, error } = useLoad(listLogs);
  return (
    <Loading data={data} error={error}>
      <p className="mb-4 text-sm text-muted">Written automatically by the database whenever an admin moderates content. It cannot be edited from the website.</p>
      {data && data.length === 0 ? (
        <EmptyState title="No activity yet" text="Moderation actions appear here." />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10 text-sm">
          {(data || []).map((l) => (
            <li key={l.id} className="p-3">
              <p><span className="font-semibold text-neon">{l.action.replace(/_/g, ' ')}</span> <span className="text-muted">by @{l.profiles?.username || 'unknown'} · {new Date(l.created_at).toLocaleString()}</span></p>
              {l.details && Object.keys(l.details).length > 0 && <p className="mt-1 break-words text-white/60">{Object.entries(l.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>}
            </li>
          ))}
        </ul>
      )}
    </Loading>
  );
}
