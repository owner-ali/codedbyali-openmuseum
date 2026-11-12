import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, ImageIcon, LayoutDashboard, MessageSquare, Settings, Upload as UploadIcon, UserCog, UserPlus, Users } from 'lucide-react';
import Seo from '../components/common/Seo';
import DashboardShell from '../components/dashboard/DashboardShell';
import MyArtwork from '../components/dashboard/MyArtwork';
import ProfileForm from '../components/dashboard/ProfileForm';
import UploadForm from '../components/artwork/UploadForm';
import EmptyState from '../components/common/EmptyState';
import Notice from '../components/common/Notice';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import RequireAuth from '../components/common/RequireAuth';
import MasonryGallery from '../components/gallery/MasonryGallery';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useFavorites, keyArt } from '../context/FavoritesContext';
import { listFollowers, listFollowing, listMine, listMyComments } from '../services/artworks';
import { formatDate } from '../lib/format';

const ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'artwork', label: 'My Artwork', icon: ImageIcon },
  { id: 'upload', label: 'Upload New Artwork', icon: UploadIcon },
  { id: 'favorites', label: 'My Favorites', icon: Heart },
  { id: 'followers', label: 'Followers', icon: Users },
  { id: 'following', label: 'Following', icon: UserPlus },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'profile', label: 'Profile Settings', icon: UserCog },
  { id: 'account', label: 'Account Settings', icon: Settings },
];

function Stat({ label, value }) {
  return (
    <div className="border border-white/10 bg-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}

function PeopleList({ people, empty }) {
  if (!people) return <p className="text-sm text-muted">Loading…</p>;
  if (people.length === 0) return empty;
  return (
    <ul className="divide-y divide-white/10 border border-white/10">
      {people.map((p) => (
        <li key={p.id}>
          <Link to={`/artists/${p.username}`} className="flex items-center justify-between p-4 hover:text-neon">
            <span><span className="block font-display text-lg font-bold">{p.display_name || p.username}</span><span className="text-sm text-muted">@{p.username}</span></span>
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PasswordForm() {
  const { updatePassword } = useAuth();
  const [pw, setPw] = useState('');
  const [conf, setConf] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ type: 'err', text: 'Use at least 8 characters.' });
    if (pw !== conf) return setMsg({ type: 'err', text: 'Passwords do not match.' });
    const { error } = await updatePassword(pw);
    if (error) return setMsg({ type: 'err', text: error.message });
    setPw('');
    setConf('');
    setMsg({ type: 'ok', text: 'Password updated.' });
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field id="a-pw" type="password" label="New password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
      <Field id="a-pw2" type="password" label="Confirm password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" />
      {msg.type === 'err' && <p role="alert" className="text-sm text-red-300">{msg.text}</p>}
      {msg.type === 'ok' && <Notice tone="success">{msg.text}</Notice>}
      <Button type="submit">Change password</Button>
    </form>
  );
}

function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { artworks } = useCatalog();
  const { favorites, following } = useFavorites();
  const [params, setParams] = useSearchParams();
  const tab = ITEMS.some((i) => i.id === params.get('tab')) ? params.get('tab') : 'overview';

  const [mine, setMine] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [followingList, setFollowingList] = useState(null);
  const [comments, setComments] = useState(null);
  const [error, setError] = useState('');

  const loadMine = useCallback(() => listMine(user.id).then(setMine).catch((e) => setError(e.message)), [user.id]);
  useEffect(() => { loadMine(); listFollowers(user.id).then(setFollowers).catch(() => setFollowers([])); }, [user.id, loadMine]);
  useEffect(() => { if (tab === 'following') listFollowing(user.id).then(setFollowingList).catch(() => setFollowingList([])); }, [tab, user.id]);
  useEffect(() => { if (tab === 'comments') listMyComments(user.id).then(setComments).catch((e) => { setError(e.message); setComments([]); }); }, [tab, user.id]);

  const count = (s) => (mine || []).filter((a) => a.status === s).length;
  const totalLikes = (mine || []).reduce((n, a) => n + (a.likeCount || 0), 0);
  const favItems = artworks.filter((a) => favorites.includes(keyArt(a)));

  let body;
  switch (tab) {
    case 'overview':
      body = (
        <div className="space-y-6">
          <p className="text-white/70">Signed in as <strong>{profile.display_name || profile.username}</strong>. <Link to={`/artists/${profile.username}`} className="text-neon hover:underline">View public profile</Link></p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Artworks" value={mine ? mine.length : '…'} />
            <Stat label="Approved" value={mine ? count('approved') : '…'} />
            <Stat label="Pending review" value={mine ? count('pending') : '…'} />
            <Stat label="Rejected" value={mine ? count('rejected') : '…'} />
            <Stat label="Likes received" value={mine ? totalLikes : '…'} />
            <Stat label="Followers" value={followers ? followers.length : '…'} />
            <Stat label="Following" value={following.length} />
            <Stat label="Favorites" value={favorites.length} />
          </div>
        </div>
      );
      break;
    case 'artwork':
      body = !mine ? <p className="text-sm text-muted">Loading…</p> : mine.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No artwork yet" text="Upload your first piece. It will show here with its approval status."><Button onClick={() => setParams({ tab: 'upload' })}>Upload artwork</Button></EmptyState>
      ) : <MyArtwork items={mine} setItems={setMine} />;
      break;
    case 'upload':
      body = <UploadForm onDone={loadMine} />;
      break;
    case 'favorites':
      body = favItems.length ? <MasonryGallery items={favItems} /> : <EmptyState icon={Heart} title="No favorites yet" text="Tap the heart on any artwork to save it here."><Button to="/explore">Explore the museum</Button></EmptyState>;
      break;
    case 'followers':
      body = <PeopleList people={followers} empty={<EmptyState icon={Users} title="No followers yet" text="When people follow your profile, they will be listed here." />} />;
      break;
    case 'following':
      body = <PeopleList people={followingList} empty={<EmptyState icon={UserPlus} title="Not following anyone" text="Follow artists from their profile page."><Button to="/artists">Meet the artists</Button></EmptyState>} />;
      break;
    case 'comments':
      body = !comments ? <p className="text-sm text-muted">Loading…</p> : comments.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No comments yet" text="Comments on your artwork appear here." />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {comments.map((c) => (
            <li key={c.id} className="p-4">
              <p className="text-sm text-muted">{c.profiles?.display_name || c.profiles?.username || 'Member'} on <Link to={`/artwork/${c.artworks.slug}`} className="text-neon hover:underline">{c.artworks.title}</Link> · {formatDate((c.created_at || '').slice(0, 10))}</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-white/80">{c.body}</p>
            </li>
          ))}
        </ul>
      );
      break;
    case 'profile':
      body = <ProfileForm />;
      break;
    default:
      body = (
        <div className="max-w-xl space-y-8">
          <div>
            <h2 className="font-display text-xl font-bold">Email</h2>
            <p className="mt-2 text-white/70">{user.email}</p>
          </div>
          <div><h2 className="mb-4 font-display text-xl font-bold">Change password</h2><PasswordForm /></div>
          <div className="space-y-3">
            <Button variant="ghost" onClick={signOut}>Log out</Button>
            <p className="text-xs text-muted">To delete your account entirely, delete your artwork here first, then <Link to="/contact" className="underline hover:text-neon">contact us</Link>.</p>
          </div>
        </div>
      );
  }

  return (
    <>
      <Seo title="Artist Dashboard" description="Manage your artwork, favourites and profile at CodedByAli OpenMuseum." path="/dashboard" />
      <DashboardShell eyebrow="Artist dashboard" title="Your studio." items={ITEMS} active={tab} onSelect={(id) => setParams({ tab: id }, { replace: true })}>
        {error && <Notice className="mb-4">{error}</Notice>}
        {body}
      </DashboardShell>
    </>
  );
}

export default function ArtistDashboard() {
  return (
    <RequireAuth title="Artist Dashboard">
      <Dashboard />
    </RequireAuth>
  );
}
