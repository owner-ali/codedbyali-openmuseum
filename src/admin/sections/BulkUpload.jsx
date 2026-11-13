import { useMemo, useState } from 'react';
import Notice from '../../components/common/Notice';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { ARTWORKS } from '../../data/demo';
import { slugify } from '../../lib/format';
import { validateImage } from '../../lib/validators';
import { createArtwork } from '../../services/artworks';
import { reviewArtwork } from '../../services/admin';
import { Pill } from '../ui';

const LICENSES = ['I own the copyright', 'CC BY (attribution)', 'CC BY-SA', 'CC0 (public domain dedication)'];
const DEMO_BY_SLUG = new Map(ARTWORKS.map((a) => [a.slug, a]));
const titleFromName = (name) =>
  name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

// Upload many images at once. Each image becomes an approved artwork. A file named like one
// of the built-in sample artworks (for example neon-meridian.webp) also gets that artwork's
// title, category and tags; any other file gets the category chosen below.
export default function BulkUpload() {
  const { user, profile } = useAuth();
  const { categories, refresh } = useCatalog();
  const [files, setFiles] = useState([]);
  const [artist, setArtist] = useState(profile?.display_name || '');
  const [license, setLicense] = useState(LICENSES[0]);
  const [fallbackCat, setFallbackCat] = useState('');
  const [rows, setRows] = useState({}); // name -> { state, error }
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');

  const items = useMemo(
    () =>
      files.map((file) => {
        const base = file.name.replace(/\.[^.]+$/, '');
        const demo = DEMO_BY_SLUG.get(slugify(base));
        const cat = demo ? categories.find((c) => c.slug === demo.category) : null;
        const title = demo ? demo.title : titleFromName(file.name);
        return {
          file,
          title,
          categoryId: cat?.id || fallbackCat,
          categoryName: (cat || categories.find((c) => c.id === fallbackCat))?.name || '',
          description: demo ? demo.description : `${title}. A digital artwork shared in the museum.`,
          tags: demo ? demo.tags : [],
          problem: validateImage(file),
        };
      }),
    [files, categories, fallbackCat],
  );

  const ready = items.filter((i) => !i.problem && i.categoryId);
  const noCategory = items.filter((i) => !i.problem && !i.categoryId).length;

  const pick = (e) => {
    setFiles(Array.from(e.target.files || []).slice(0, 60));
    setRows({});
    setMsg('');
  };

  const run = async () => {
    if (!artist.trim()) return setMsg('Enter the artist name to credit.');
    setRunning(true);
    setMsg('');
    let ok = 0;
    for (const it of ready) {
      if (rows[it.file.name]?.state === 'done') continue;
      setRows((r) => ({ ...r, [it.file.name]: { state: 'working' } }));
      try {
        const art = await createArtwork({
          user,
          form: { title: it.title, description: it.description, tags: it.tags, categoryId: it.categoryId, artist: artist.trim(), license },
          imageFile: it.file,
        });
        await reviewArtwork(art.id, 'approved');
        ok += 1;
        setRows((r) => ({ ...r, [it.file.name]: { state: 'done' } }));
      } catch (e) {
        setRows((r) => ({ ...r, [it.file.name]: { state: 'error', error: e.message || 'Upload failed.' } }));
      }
    }
    await refresh();
    setRunning(false);
    setMsg(`${ok} artwork${ok === 1 ? '' : 's'} uploaded and approved.`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-white/65">
        Choose many images at once (JPG, PNG or WebP, up to 10 MB each, 60 at a time). Every image is published straight away. Only upload images you own or that are public domain or CC0.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bu-artist" className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">Artist name to credit</label>
          <input id="bu-artist" value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={80} className="h-12 w-full border border-white/15 bg-white/[0.03] px-4 text-base outline-none focus:border-neon" />
        </div>
        <div>
          <label htmlFor="bu-license" className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">Licence</label>
          <select id="bu-license" value={license} onChange={(e) => setLicense(e.target.value)} className="h-12 w-full border border-white/15 bg-panel px-4 text-base outline-none focus:border-neon">
            {LICENSES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bu-cat" className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">Category for images that are not recognised</label>
          <select id="bu-cat" value={fallbackCat} onChange={(e) => setFallbackCat(e.target.value)} className="h-12 w-full border border-white/15 bg-panel px-4 text-base outline-none focus:border-neon">
            <option value="">Choose a category</option>
            {categories.map((c) => <option key={c.slug} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="bu-files" className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">Images</label>
        <input id="bu-files" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pick} disabled={running} className="block w-full text-sm" />
      </div>

      {items.length > 0 && (
        <ul className="divide-y divide-white/10 border border-white/10">
          {items.map((it) => {
            const r = rows[it.file.name];
            return (
              <li key={it.file.name} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{it.title}</p>
                  <p className="truncate text-xs text-muted">{it.problem ? it.problem : it.categoryName || 'Choose a category above'} · {it.file.name}</p>
                </div>
                <div>
                  {it.problem ? <Pill tone="bad">skipped</Pill> : r?.state === 'done' ? <Pill tone="ok">published</Pill> : r?.state === 'working' ? <Pill tone="warn">uploading</Pill> : r?.state === 'error' ? <Pill tone="bad">failed</Pill> : <Pill>waiting</Pill>}
                </div>
                {r?.error && <p className="text-xs text-red-300 sm:basis-full">{r.error}</p>}
              </li>
            );
          })}
        </ul>
      )}
      {noCategory > 0 && <Notice>{noCategory} image{noCategory === 1 ? ' has' : 's have'} no category yet. Choose one above.</Notice>}
      {msg && <Notice tone={msg.includes('uploaded') ? 'success' : 'info'}>{msg}</Notice>}
      <Button onClick={run} disabled={running || ready.length === 0}>{running ? 'Uploading…' : `Upload and publish ${ready.length || ''}`.trim()}</Button>
    </div>
  );
}
