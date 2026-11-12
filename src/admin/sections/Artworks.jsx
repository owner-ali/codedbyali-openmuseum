import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Notice from '../../components/common/Notice';
import ArtPiece from '../../components/gallery/ArtPiece';
import { useCatalog } from '../../context/CatalogContext';
import { adminDeleteArtwork, adminUpdateArtwork, listAllArtworks, reviewArtwork, setFeatured } from '../../services/admin';
import { Btn, Loading, Pill, useLoad } from '../ui';

const TONE = { pending: 'warn', approved: 'ok', rejected: 'bad' };

// mode: 'approvals' (pending queue), 'all' (edit / delete anything), 'featured' (pick featured work)
export default function Artworks({ mode }) {
  const { refresh } = useCatalog();
  const { data, setData, error } = useLoad(listAllArtworks);
  const [msg, setMsg] = useState('');

  const patchLocal = (id, patch) => setData((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const run = async (fn, localPatch, id) => {
    try {
      await fn();
      if (localPatch) patchLocal(id, localPatch);
      setMsg('');
      refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const approve = (a) => run(() => reviewArtwork(a.id, 'approved'), { status: 'approved', rejectionReason: null }, a.id);
  const reject = (a) => {
    const reason = window.prompt('Reason for rejection (shown to the artist):', '');
    if (reason === null) return;
    run(() => reviewArtwork(a.id, 'rejected', reason.trim() || 'Does not meet the museum guidelines.'), { status: 'rejected', rejectionReason: reason.trim() }, a.id);
  };
  const toggleFeatured = (a) => run(() => setFeatured(a.id, !a.featured), { featured: !a.featured }, a.id);
  const rename = (a) => {
    const title = window.prompt('New title:', a.title);
    if (!title || title.trim().length < 3) return;
    run(() => adminUpdateArtwork(a.id, { title: title.trim() }), { title: title.trim() }, a.id);
  };
  const remove = (a) => {
    if (!window.confirm(`Delete "${a.title}" permanently?`)) return;
    run(async () => {
      await adminDeleteArtwork(a);
      setData((l) => l.filter((x) => x.id !== a.id));
    });
  };

  let list = data || [];
  if (mode === 'approvals') list = list.filter((a) => a.status === 'pending');
  if (mode === 'featured') list = list.filter((a) => a.status === 'approved');

  return (
    <Loading data={data} error={error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      {list.length === 0 ? (
        <EmptyState title={mode === 'approvals' ? 'Nothing waiting for review' : 'No artwork'} text={mode === 'approvals' ? 'New submissions appear here for approval.' : ''} />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {list.map((a) => (
            <li key={a.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <a href={a.imageUrl} target="_blank" rel="noopener noreferrer" className="block h-32 w-28 shrink-0 overflow-hidden bg-ink" aria-label={`Open full image of ${a.title}`}><ArtPiece art={a} thumb /></a>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-2xl">{a.status === 'approved' ? <Link to={`/artwork/${a.slug}`} className="hover:text-neon">{a.title}</Link> : a.title}</p>
                <p className="mt-1 text-sm text-muted">{a.artistName} · {a.categoryName} · {a.createdAt} · {a.license}</p>
                {a.description && <p className="mt-1 line-clamp-2 text-sm text-white/60">{a.description}</p>}
                <div className="mt-2 flex flex-wrap gap-2"><Pill tone={TONE[a.status]}>{a.status}</Pill>{a.featured && <Pill tone="ok">featured</Pill>}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.status !== 'approved' && <Btn onClick={() => approve(a)}>Approve</Btn>}
                {a.status !== 'rejected' && <Btn danger onClick={() => reject(a)}>Reject</Btn>}
                {mode !== 'approvals' && a.status === 'approved' && <Btn onClick={() => toggleFeatured(a)}>{a.featured ? 'Unfeature' : 'Feature'}</Btn>}
                {mode === 'all' && <Btn onClick={() => rename(a)}>Edit title</Btn>}
                {mode !== 'featured' && <Btn danger onClick={() => remove(a)}>Delete</Btn>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Loading>
  );
}
