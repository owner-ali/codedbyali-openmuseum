import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, X } from 'lucide-react';
import ArtPiece from '../gallery/ArtPiece';
import Field from '../common/Field';
import Button from '../common/Button';
import Notice from '../common/Notice';
import { useCatalog } from '../../context/CatalogContext';
import { deleteArtwork, updateArtwork } from '../../services/artworks';

const BADGE = {
  pending: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  approved: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
  rejected: 'border-red-300/40 bg-red-300/10 text-red-200',
};
const LICENSES = ['I own the copyright', 'CC BY (attribution)', 'CC BY-SA', 'CC0 (public domain dedication)', 'Other (explain in description)'];

function EditDialog({ art, onClose, onSaved }) {
  const { categories } = useCatalog();
  const [f, setF] = useState({
    title: art.title,
    description: art.description,
    categoryId: categories.find((c) => c.slug === art.category)?.id || '',
    license: art.license,
    artist: art.artistName,
    tags: art.tags.join(', '),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (f.title.trim().length < 3) return setError('Title needs 3+ characters.');
    if (!f.categoryId) return setError('Choose a category.');
    setBusy(true);
    setError('');
    try {
      const tags = [...new Set(f.tags.split(',').map((t) => t.trim().replace(/^#/, '').toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean))].slice(0, 8);
      const updated = await updateArtwork(art.id, { ...f, tags });
      onSaved(updated);
    } catch (err) {
      setError(err.message || 'Could not save changes.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/85 p-0 backdrop-blur-md sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Edit ${art.title}`} onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[100svh] w-full max-w-xl space-y-5 overflow-y-auto border border-white/10 bg-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Edit artwork</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center hover:text-neon"><X size={20} /></button>
        </div>
        <Notice>Saving changes sends the artwork back to review.</Notice>
        <Field id="e-title" label="Title" value={f.title} onChange={set('title')} maxLength={90} />
        <Field id="e-desc" as="textarea" rows={4} label="Description" value={f.description} onChange={set('description')} maxLength={1200} />
        <Field id="e-cat" as="select" label="Category" value={f.categoryId} onChange={set('categoryId')} className="bg-panel">
          <option value="">Choose a category</option>
          {categories.map((c) => <option key={c.slug} value={c.id}>{c.name}</option>)}
        </Field>
        <Field id="e-tags" label="Tags (comma separated)" value={f.tags} onChange={set('tags')} />
        <Field id="e-artist" label="Artist attribution" value={f.artist} onChange={set('artist')} maxLength={80} />
        <Field id="e-lic" as="select" label="Licence" value={f.license} onChange={set('license')} className="bg-panel">
          {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
        </Field>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default function MyArtwork({ items, setItems, onChanged }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const remove = async (art) => {
    if (!window.confirm(`Delete "${art.title}" permanently? This cannot be undone.`)) return;
    try {
      await deleteArtwork(art);
      setItems((x) => x.filter((a) => a.id !== art.id));
      onChanged?.();
    } catch (e) {
      setError(e.message || 'Could not delete.');
    }
  };

  return (
    <>
      {error && <Notice className="mb-4">{error}</Notice>}
      <ul className="divide-y divide-white/10 border border-white/10">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="h-28 w-24 shrink-0 overflow-hidden bg-ink"><ArtPiece art={a} thumb /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-2xl">{a.status === 'approved' ? <Link to={`/artwork/${a.slug}`} className="hover:text-neon">{a.title}</Link> : a.title}</p>
              <p className="mt-1 text-sm text-muted">{a.categoryName} · {a.createdAt}{a.status === 'approved' ? ` · ${a.likeCount} likes · ${a.downloads} downloads` : ''}</p>
              <span className={`mt-2 inline-block border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] ${BADGE[a.status]}`}>{a.status}</span>
              {a.status === 'rejected' && a.rejectionReason && <p className="mt-2 text-sm text-red-200">Reason: {a.rejectionReason}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(a)} className="flex h-11 items-center gap-2 border border-white/15 px-3 text-sm hover:border-neon hover:text-neon"><Pencil size={15} /> Edit</button>
              <button type="button" onClick={() => remove(a)} className="flex h-11 items-center gap-2 border border-white/15 px-3 text-sm hover:border-red-300 hover:text-red-300"><Trash2 size={15} /> Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <EditDialog
          art={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setItems((x) => x.map((a) => (a.id === updated.id ? updated : a)));
            setEditing(null);
            onChanged?.();
          }}
        />
      )}
    </>
  );
}
