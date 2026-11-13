import { useSearchParams } from 'react-router-dom';
import { BarChart3, CheckCircle2, FileText, Flag, History, Layers, LayoutTemplate, ListChecks, MessageSquare, Palette, UploadCloud, Settings as Cog, Star, UserCog, Users } from 'lucide-react';
import Seo from '../components/common/Seo';
import DashboardShell from '../components/dashboard/DashboardShell';
import RequireAuth from '../components/common/RequireAuth';
import Analytics from './sections/Analytics';
import UsersSection from './sections/Users';
import ArtistsSection from './sections/Artists';
import Artworks from './sections/Artworks';
import Categories from './sections/Categories';
import Exhibitions from './sections/Exhibitions';
import Reports from './sections/Reports';
import Comments from './sections/Comments';
import Settings from './sections/Settings';
import Logs from './sections/Logs';
import BulkUpload from './sections/BulkUpload';

const SECTIONS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, render: () => <Analytics /> },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2, render: () => <Artworks mode="approvals" /> },
  { id: 'artwork', label: 'Artwork', icon: ListChecks, render: () => <Artworks mode="all" /> },
  { id: 'bulk', label: 'Bulk upload', icon: UploadCloud, render: () => <BulkUpload /> },
  { id: 'featured', label: 'Featured', icon: Star, render: () => <Artworks mode="featured" /> },
  { id: 'users', label: 'Users', icon: Users, render: () => <UsersSection /> },
  { id: 'artists', label: 'Artists', icon: UserCog, render: () => <ArtistsSection /> },
  { id: 'categories', label: 'Categories', icon: Layers, render: () => <Categories /> },
  { id: 'exhibitions', label: 'Exhibitions', icon: FileText, render: () => <Exhibitions /> },
  { id: 'homepage', label: 'Homepage', icon: LayoutTemplate, render: () => <Settings mode="homepage" /> },
  { id: 'reports', label: 'Reports', icon: Flag, render: () => <Reports /> },
  { id: 'comments', label: 'Comments', icon: MessageSquare, render: () => <Comments /> },
  { id: 'settings', label: 'Site settings', icon: Cog, render: () => <Settings mode="settings" /> },
  { id: 'branding', label: 'Branding', icon: Palette, render: () => <Settings mode="branding" /> },
  { id: 'logs', label: 'Audit log', icon: History, render: () => <Logs /> },
];

function Panel() {
  const [params, setParams] = useSearchParams();
  const tab = SECTIONS.some((s) => s.id === params.get('tab')) ? params.get('tab') : 'analytics';
  const section = SECTIONS.find((s) => s.id === tab);
  return (
    <>
      <Seo title="Admin Panel" description="Museum administration." path="/admin" />
      <DashboardShell eyebrow="Administration" title="Admin panel." items={SECTIONS} active={tab} onSelect={(id) => setParams({ tab: id }, { replace: true })}>
        <h2 className="mb-6 font-display text-3xl font-bold">{section.label}</h2>
        {/* key resets section state when switching tabs */}
        <div key={tab}>{section.render()}</div>
      </DashboardShell>
    </>
  );
}

// The interface hides this page from non-admins, but the real enforcement is in the
// database: every read and write below is checked by Row Level Security.
export default function AdminDashboard() {
  return (
    <RequireAuth admin title="Admin Panel">
      <Panel />
    </RequireAuth>
  );
}
