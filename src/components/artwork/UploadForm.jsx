import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Field from '../common/Field';
import Notice from '../common/Notice';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { createArtwork } from '../../services/artworks';
import { reviewArtwork } from '../../services/admin';
import { ALLOWED_EXTENSIONS, MAX_IMAGE_MB, validateImage } from '../../lib/validators';

const LICENSES = ['I own the copyright', 'CC BY (attribution)', 'CC BY-SA', 'CC0 (public domain dedication)', 'Other (explain in description)'];

function useObjectUrl(file) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) {
      setUrl('');
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

function ImagePicker({ id, label, file, onFile, error, hint, required }) {
  const url = useObjectUrl(file);
  const inputRef = useRef(null);
  return (
    <div>
      <p id={`${id}-label`} className="mb-2 font-display text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {label} {required && <span className="text-neon">*</span>}
      </p>
      <div className={`border border-dashed p-4 ${error ? 'border-red-400/70' : 'border-white/20'}`}>
        {url ? (
          <div className="relative mx-auto max-w-sm">
            <img src={url} alt={`Preview of selected ${label.toLowerCase()}`} className="max-h-80 w-full object-contain" />
            <button type="button" onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = ''; }} aria-label={`Remove ${label.toLowerCase()}`} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center bg-ink/80 hover:text-neon">
              <X size={18} />
            </button>
            <p className="mt-2 truncate text-center text-xs text-muted">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-2 py-8 text-center text-white/60 hover:text-neon">
            <ImagePlus size={28} aria-hidden="true" />
            <span className="text-sm">Tap to choose an image</span>
            <span className="text-xs text-muted">{ALLOWED_EXTENSIONS.join(', ').toUpperCase()} · up to {MAX_IMAGE_MB} MB</span>
          </label>
        )}
        <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => onFile(e.target.files?.[0] || null)} />
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-red-300">{error}</p> : hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default function UploadForm({ onDone }) {
  const { user, profile, isAdmin } = useAuth();
  const { categories } = useCatalog();
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', artist: profile?.display_name || '', license: '', confirm: false });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [progress, setProgress] = useState(null);
  const [created, setCreated] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addTag = (raw) => {
    const t = raw.trim().replace(/^#/, '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
    if (t && !tags.includes(t) && tags.length < 8) setTags((x) => [...x, t]);
    setTagInput('');
  };

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 3) e.title = 'Give your artwork a title (3+ characters).';
    if (form.description.trim().length < 20) e.description = 'Write at least 20 characters about the artwork.';
    if (!form.categoryId) e.categoryId = 'Choose a category.';
    if (!form.artist.trim()) e.artist = 'Enter the artist name to credit.';
    if (!form.license) e.license = 'Choose a licence.';
    const imgErr = validateImage(image);
    if (imgErr) e.image = imgErr;
    if (preview) {
      const pErr = validateImage(preview);
      if (pErr) e.preview = pErr;
    }
    if (!form.confirm) e.confirm = 'You must confirm you have the right to publish this work.';
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) {
      document.getElementById('upload-errors')?.focus();
      return;
    }
    setProgress(0);
    try {
      const art = await createArtwork({ user, form: { ...form, tags }, imageFile: image, previewFile: preview, onProgress: setProgress });
      let autoApproved = false;
      if (isAdmin) {
        try {
          await reviewArtwork(art.id, 'approved');
          autoApproved = true;
        } catch {
          autoApproved = false;
        }
      }
      setCreated({ ...art, autoApproved });
      onDone?.(art);
    } catch (err) {
      setFormError(err.message || 'Upload failed. Please try again.');
      setProgress(null);
    }
  };

  if (created) {
    return (
      <div className="max-w-2xl space-y-5">
        <Notice tone="success">
          <p className="font-semibold">"{created.title}" was submitted.</p>
          {created.autoApproved ? (
            <p className="mt-1">You are an admin, so it was <strong>approved</strong> straight away and is now public.</p>
          ) : (
            <p className="mt-1">It is now <strong>pending</strong>. A curator will review it, and it becomes public once approved. You can follow its status in My Artwork.</p>
          )}
        </Notice>
        <Button variant="ghost" onClick={() => window.location.assign('/upload')}>Upload another</Button>
      </div>
    );
  }

  const errorList = Object.values(errors);
  const busy = progress !== null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-5xl gap-8 lg:grid-cols-2">
      {(errorList.length > 0 || formError) && (
        <div id="upload-errors" tabIndex={-1} role="alert" className="border border-red-400/50 bg-red-400/10 p-4 text-sm text-red-100 lg:col-span-2">
          {formError && <p className="font-semibold">{formError}</p>}
          {errorList.length > 0 && (
            <>
              <p className="font-semibold">Please fix {errorList.length} {errorList.length === 1 ? 'issue' : 'issues'}:</p>
              <ul className="mt-2 list-disc pl-5">{errorList.map((m) => <li key={m}>{m}</li>)}</ul>
            </>
          )}
        </div>
      )}

      <div className="space-y-6">
        <Field id="up-title" label="Artwork title" value={form.title} onChange={set('title')} error={errors.title} maxLength={90} placeholder="e.g. Neon Meridian" />
        <Field id="up-desc" as="textarea" rows={5} label="Description" value={form.description} onChange={set('description')} error={errors.description} maxLength={1200} placeholder="Tell the story behind the piece" />
        <Field id="up-cat" as="select" label="Category" value={form.categoryId} onChange={set('categoryId')} error={errors.categoryId} className="bg-panel">
          <option value="">Choose a category</option>
          {categories.map((c) => <option key={c.slug} value={c.id}>{c.name}</option>)}
        </Field>
        <div>
          <label htmlFor="up-tags" className="mb-2 block font-display text-[0.7rem] uppercase tracking-[0.18em] text-muted">Tags (up to 8)</label>
          <div className="flex flex-wrap gap-2 border border-white/15 bg-white/[0.03] p-2">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 border border-neon/40 bg-neon/10 py-1 pl-2.5 pr-1 text-sm text-neon">
                #{t}
                <button type="button" onClick={() => setTags((x) => x.filter((y) => y !== t))} aria-label={`Remove tag ${t}`} className="flex h-6 w-6 items-center justify-center hover:text-white"><X size={14} /></button>
              </span>
            ))}
            <input
              id="up-tags"
              value={tagInput}
              onChange={(e) => (e.target.value.endsWith(',') ? addTag(e.target.value.slice(0, -1)) : setTagInput(e.target.value))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length ? '' : 'Type a tag, press Enter'}
              className="min-w-[8rem] flex-1 bg-transparent px-2 py-2 text-base outline-none placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ImagePicker id="up-image" label="Artwork image" required file={image} onFile={setImage} error={errors.image} />
        <ImagePicker id="up-preview" label="Preview image (optional)" file={preview} onFile={setPreview} error={errors.preview} hint="A smaller cover image shown on cards. Optional." />
        <Field id="up-artist" label="Artist attribution" value={form.artist} onChange={set('artist')} error={errors.artist} placeholder="Name to credit" maxLength={80} />
        <Field id="up-license" as="select" label="Licence / copyright declaration" value={form.license} onChange={set('license')} error={errors.license} className="bg-panel">
          <option value="">Choose a licence</option>
          {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
        </Field>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
            <input type="checkbox" checked={form.confirm} onChange={set('confirm')} className="mt-1 h-5 w-5 shrink-0 accent-[#00E5FF]" />
            I confirm I created this work or have the right to publish it, and that it follows the Terms &amp; Conditions.
          </label>
          {errors.confirm && <p role="alert" className="mt-2 text-sm text-red-300">{errors.confirm}</p>}
        </div>
      </div>

      <div className="lg:col-span-2">
        {busy && (
          <div className="mb-4" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Upload progress">
            <div className="h-1.5 w-full bg-white/10"><div className="h-full bg-gradient-to-r from-neon to-purple transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-muted">{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Saving…'}</p>
          </div>
        )}
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>{busy ? 'Uploading…' : 'Submit for review'}</Button>
      </div>
    </form>
  );
}
