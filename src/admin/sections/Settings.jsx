import { useState } from 'react';
import Field from '../../components/common/Field';
import Button from '../../components/common/Button';
import Notice from '../../components/common/Notice';
import { useCatalog } from '../../context/CatalogContext';
import { saveSettings, uploadSiteImage } from '../../services/admin';
import { validateImage } from '../../lib/validators';
import { publicUrl } from '../../lib/supabase';

const FIELDS = {
  homepage: [
    { key: 'hero_label', label: 'Hero label', max: 60 },
    { key: 'hero_heading', label: 'Hero heading', max: 80 },
    { key: 'hero_description', label: 'Hero description', area: true, max: 300 },
    { key: 'announcement', label: 'Announcement banner (leave empty to hide)', max: 200 },
  ],
  settings: [{ key: 'contact_email', label: 'Public contact email (used by the Contact page)', max: 120, type: 'email' }],
};

// mode: 'homepage' | 'settings' | 'branding'
export default function Settings({ mode }) {
  const { settings, refresh } = useCatalog();
  const fields = FIELDS[mode] || [];
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.key, typeof settings[f.key] === 'string' ? settings[f.key] : ''])));
  const [msg, setMsg] = useState({ t: '', m: '' });
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveSettings(vals);
      await refresh();
      setMsg({ t: 'ok', m: 'Saved.' });
    } catch (err) {
      setMsg({ t: 'err', m: err.message });
    }
    setBusy(false);
  };

  const logo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err || file.type === 'image/gif') return setMsg({ t: 'err', m: err || 'Use JPG, PNG or WebP.' });
    setBusy(true);
    try {
      const path = await uploadSiteImage(file, 'branding');
      await saveSettings({ logo_path: path });
      await refresh();
      setMsg({ t: 'ok', m: 'Logo updated.' });
    } catch (er) {
      setMsg({ t: 'err', m: er.message });
    }
    setBusy(false);
  };

  const resetLogo = async () => {
    await saveSettings({ logo_path: '' });
    await refresh();
    setMsg({ t: 'ok', m: 'Back to the default logo.' });
  };

  if (mode === 'branding') {
    const current = typeof settings.logo_path === 'string' && settings.logo_path ? publicUrl('site', settings.logo_path) : '';
    return (
      <div className="max-w-xl space-y-5">
        <p className="text-white/65">Upload a square logo (JPG, PNG or WebP). It replaces the built-in mark in the header and loading area.</p>
        {current && <img src={current} alt="Current logo" className="h-20 w-20 border border-white/10 object-contain p-2" />}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={logo} disabled={busy} aria-label="Upload logo" className="block w-full text-sm" />
        {current && <Button variant="ghost" onClick={resetLogo}>Use default logo</Button>}
        <p className="text-xs text-muted">The favicon is the file public/favicon.svg in the project. Replace that file and redeploy to change it.</p>
        {msg.m && <Notice tone={msg.t === 'ok' ? 'success' : 'info'}>{msg.m}</Notice>}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-5">
      {fields.map((f) => (
        <Field key={f.key} id={`s-${f.key}`} as={f.area ? 'textarea' : 'input'} rows={f.area ? 4 : undefined} type={f.type} label={f.label} maxLength={f.max} value={vals[f.key]} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))} />
      ))}
      {msg.m && <Notice tone={msg.t === 'ok' ? 'success' : 'info'}>{msg.m}</Notice>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
    </form>
  );
}
