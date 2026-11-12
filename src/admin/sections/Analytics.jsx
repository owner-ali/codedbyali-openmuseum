import { adminStats } from '../../services/admin';
import { Loading, useLoad } from '../ui';

const LABELS = [
  ['members', 'Members'],
  ['artworks', 'Artworks (all)'],
  ['approved', 'Approved'],
  ['pending', 'Pending review'],
  ['rejected', 'Rejected'],
  ['likes', 'Likes'],
  ['comments', 'Comments'],
  ['downloads', 'Downloads'],
  ['open_reports', 'Open reports'],
];

export default function Analytics() {
  const { data, error } = useLoad(adminStats);
  return (
    <Loading data={data} error={error}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LABELS.map(([k, label]) => (
          <div key={k} className="border border-white/10 bg-panel p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{label}</p>
            <p className={`mt-2 font-display text-4xl font-bold ${(k === 'pending' || k === 'open_reports') && data[k] > 0 ? 'text-neon' : ''}`}>{data[k]}</p>
          </div>
        ))}
      </div>
    </Loading>
  );
}
