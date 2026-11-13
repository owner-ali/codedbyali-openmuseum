import { Link } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
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

const has = (v) => typeof v === 'string' && v.trim().length > 0;

// A short list of the things a new museum needs, ticked from real data.
function SetupChecklist({ stats }) {
  const { settings, exhibitions } = useCatalog();
  const steps = [
    { done: has(settings.contact_email), label: 'Set the public contact email', tab: 'settings' },
    { done: has(settings.hero_heading), label: 'Write your own homepage heading and text', tab: 'homepage' },
    { done: has(settings.logo_path), label: 'Upload your logo (optional)', tab: 'branding' },
    { done: stats.approved > 0, label: 'Publish your first artwork (upload one from the menu, admin uploads are approved at once)', tab: 'artwork' },
    { done: stats.pending === 0, label: stats.pending > 0 ? `Review ${stats.pending} waiting artwork` : 'Review waiting artwork', tab: 'approvals' },
    { done: exhibitions.length > 0, label: 'Create and publish an exhibition', tab: 'exhibitions' },
  ];
  const left = steps.filter((s) => !s.done).length;
  return (
    <div className="mb-8 border border-white/10 bg-panel p-5">
      <h3 className="font-display text-xl font-bold">Setup checklist</h3>
      <p className="mt-1 text-sm text-muted">{left === 0 ? 'Everything is set up.' : `${left} of ${steps.length} steps left.`}</p>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link to={`/admin?tab=${s.tab}`} className={`flex items-start gap-3 py-1 text-sm ${s.done ? 'text-white/45' : 'text-white hover:text-neon'}`}>
              {s.done ? <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" /> : <Circle size={18} className="mt-0.5 shrink-0 text-white/40" aria-hidden="true" />}
              <span className={s.done ? 'line-through' : ''}>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Analytics() {
  const { data, error } = useLoad(adminStats);
  return (
    <Loading data={data} error={error}>
      <SetupChecklist stats={data} />
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
