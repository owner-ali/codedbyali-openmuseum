import { useState } from 'react';
import Field from '../../components/common/Field';
import Button from '../../components/common/Button';
import Notice from '../../components/common/Notice';
import { useCatalog } from '../../context/CatalogContext';
import { deleteExhibition, listAllArtworks, listExhibitions, saveExhibition, uploadSiteImage } from '../../services/admin';
import { validateImage } from '../../lib/validators';
import { Btn, Loading, Pill, useLoad } from '../ui';

const blank = { title: '', subtitle: '', description: '', curator_note: '', start_date: '', end_date: '', status: 'draft', cover_path: '' };

function Editor({ initial, picked: startPicked, works, onSaved, onCancel }) {
  const [f, setF] = useState(initial);
  const [picked, setPicked] = useState(startPicked);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const cover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) return setError(err);
    setBusy(true);
    try {
      const path = await uploadSiteImage(file, 'covers');
      setF((x) => ({ ...x, cover_path: path }));
      setError('');
    } catch (er) {
      setError(er.message);
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (f.title.trim().length < 3) return setError('Title needs 3+ characters.');
    if (f.start_date && f.end_date && f.end_date < f.start_date) return setError('End date must be after the start date.');
    setBusy(true);
    try {
      await saveExhibition(f, picked);
      onSaved();
    } catch (er) {
      setError(er.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8 space-y-4 border border-white/10 bg-panel p-5">
      <h3 className="font-display text-lg font-bold">{f.id ? 'Edit exhibition' : 'New exhibition'}</h3>
      <Field id="x-title" label="Title" value={f.title} onChange={set('title')} maxLength={90} />
      <Field id="x-sub" label="Subtitle" value={f.subtitle || ''} onChange={set('subtitle')} />
      <Field id="x-desc" as="textarea" rows={4} label="Description" value={f.description || ''} onChange={set('description')} />
      <Field id="x-cur" label="Curator note" value={f.curator_note || ''} onChange={set('curator_note')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="x-start" type="date" label="Start date" value={f.start_date || ''} onChange={set('start_date')} />
        <Field id="x-end" type="date" label="End date" value={f.end_date || ''} onChange={set('end_date')} />
        <Field id="x-status" as="select" label="Status" value={f.status} onChange={set('status')} className="bg-panel"><option value="draft">Draft</option><option value="published">Published</option></Field>
      </div>
      <div>
        <label htmlFor="x-cover" className="mb-2 block font-display text-[0.7rem] uppercase tracking-[0.18em] text-muted">Cover image {f.cover_path && '(uploaded)'}</label>
        <input id="x-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={cover} className="block w-full text-sm" />
      </div>
      <fieldset>
        <legend className="mb-2 font-display text-[0.7rem] uppercase tracking-[0.18em] text-muted">Featured artworks ({picked.length} chosen)</legend>
        {works.length === 0 ? <p className="text-sm text-muted">No approved artwork yet.</p> : (
          <ul className="grid max-h-64 gap-1 overflow-y-auto border border-white/10 p-2 sm:grid-cols-2">
            {works.map((a) => (
              <li key={a.id}><label className="flex cursor-pointer items-center gap-3 p-2 text-sm hover:bg-white/5"><input type="checkbox" checked={picked.includes(a.id)} onChange={() => toggle(a.id)} className="h-5 w-5 accent-[#00E5FF]" />{a.title}</label></li>
            ))}
          </ul>
        )}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save exhibition'}</Button><Button variant="ghost" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}

export default function Exhibitions() {
  const { refresh } = useCatalog();
  const list = useLoad(listExhibitions);
  const works = useLoad(async () => (await listAllArtworks()).filter((a) => a.status === 'approved'));
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const done = async () => {
    setEditing(null);
    await list.reload();
    refresh();
  };
  const remove = async (ex) => {
    if (!window.confirm(`Delete "${ex.title}"?`)) return;
    try {
      await deleteExhibition(ex.id);
      await done();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <Loading data={list.data && works.data} error={list.error || works.error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      {editing ? (
        <Editor
          initial={editing.id ? editing : blank}
          picked={editing.id ? [...(editing.exhibition_artworks || [])].sort((a, b) => a.position - b.position).map((x) => x.artwork_id) : []}
          works={works.data}
          onSaved={done}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="mb-6"><Button onClick={() => setEditing({})}>New exhibition</Button></div>
      )}
      {list.data && (
        <ul className="divide-y divide-white/10 border border-white/10">
          {list.data.length === 0 && <li className="p-6 text-sm text-muted">No exhibitions yet.</li>}
          {list.data.map((ex) => (
            <li key={ex.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1"><p className="font-serif text-2xl">{ex.title}</p><p className="mt-1 text-sm text-muted">{ex.exhibition_artworks?.length || 0} artworks</p><div className="mt-2"><Pill tone={ex.status === 'published' ? 'ok' : 'warn'}>{ex.status}</Pill></div></div>
              <div className="flex gap-2"><Btn onClick={() => setEditing(ex)}>Edit</Btn><Btn danger onClick={() => remove(ex)}>Delete</Btn></div>
            </li>
          ))}
        </ul>
      )}
    </Loading>
  );
}
