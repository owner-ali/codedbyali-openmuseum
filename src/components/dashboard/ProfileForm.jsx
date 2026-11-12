import { useState } from 'react';
import ArtPiece from '../gallery/ArtPiece';
import Field from '../common/Field';
import Button from '../common/Button';
import Notice from '../common/Notice';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { prepareImage, randomId } from '../../lib/image';
import { validateImage } from '../../lib/validators';
import { uploadWithProgress, removeFiles } from '../../services/storage';
import { normalizeArtist } from '../../services/catalog';

const SOCIALS = ['instagram', 'x', 'behance', 'artstation', 'youtube'];
const isUrl = (v) => !v || /^https?:\/\/\S+\.\S+/i.test(v);

export default function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [f, setF] = useState({
    username: profile.username,
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    country: profile.country || '',
    website: profile.website || '',
    ...Object.fromEntries(SOCIALS.map((s) => [s, profile.social?.[s] || ''])),
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const me = normalizeArtist(profile);

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err || file.type === 'image/gif') {
      setError(err || 'Please use a JPG, PNG or WebP image for your profile picture.');
      return;
    }
    setError('');
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();
    setOk(false);
    if (!/^[a-z0-9_]{3,30}$/.test(f.username)) return setError('Username: 3-30 characters, lowercase letters, numbers or underscore.');
    if (!f.display_name.trim()) return setError('Enter a display name.');
    for (const k of ['website', ...SOCIALS]) if (!isUrl(f[k].trim())) return setError(`"${k}" must start with http:// or https://`);
    setBusy(true);
    setError('');
    try {
      let avatar_path = profile.avatar_path;
      if (avatar) {
        const prepared = await prepareImage(avatar, 512);
        const path = `${user.id}/${randomId()}.${prepared.ext}`;
        await uploadWithProgress('avatars', path, prepared.blob);
        if (profile.avatar_path) await removeFiles('avatars', [profile.avatar_path]).catch(() => {});
        avatar_path = path;
      }
      const social = Object.fromEntries(SOCIALS.map((s) => [s, f[s].trim()]).filter(([, v]) => v));
      const { error: err } = await supabase
        .from('profiles')
        .update({
          username: f.username,
          display_name: f.display_name.trim(),
          bio: f.bio.trim() || null,
          country: f.country.trim() || null,
          website: f.website.trim() || null,
          social,
          avatar_path,
        })
        .eq('id', user.id);
      if (err) throw err.code === '23505' ? new Error('That username is already taken.') : err;
      await refreshProfile();
      setAvatar(null);
      setOk(true);
    } catch (err) {
      setError(err.message || 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-5">
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-white/15">
          <ArtPiece art={{ ...me, imageUrl: avatarPreview || me.avatarUrl, alt: 'Your profile picture' }} variant="orbs" />
        </div>
        <div>
          <label htmlFor="avatar" className="inline-flex h-11 cursor-pointer items-center border border-white/20 px-4 text-sm hover:border-neon hover:text-neon">Change picture</label>
          <input id="avatar" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickAvatar} />
          <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 2 MB.</p>
        </div>
      </div>
      <Field id="p-user" label="Username (your profile link)" value={f.username} onChange={(e) => setF((x) => ({ ...x, username: e.target.value.toLowerCase() }))} maxLength={30} />
      <Field id="p-name" label="Display name" value={f.display_name} onChange={set('display_name')} maxLength={60} />
      <Field id="p-bio" as="textarea" rows={4} label="Biography" value={f.bio} onChange={set('bio')} maxLength={600} />
      <Field id="p-country" label="Country / location (optional)" value={f.country} onChange={set('country')} maxLength={80} />
      <Field id="p-web" type="url" label="Website" value={f.website} onChange={set('website')} placeholder="https://" />
      {SOCIALS.map((s) => (
        <Field key={s} id={`p-${s}`} type="url" label={`${s[0].toUpperCase()}${s.slice(1)} link`} value={f[s]} onChange={set(s)} placeholder="https://" />
      ))}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {ok && <Notice tone="success">Profile saved.</Notice>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}
