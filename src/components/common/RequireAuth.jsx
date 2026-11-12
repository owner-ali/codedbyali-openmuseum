import { Navigate, useLocation } from 'react-router-dom';
import { Database, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EmptyState from './EmptyState';
import Button from './Button';
import Seo from './Seo';
import PageFallback from './PageFallback';

function Shell({ children }) {
  return <section className="container-x flex min-h-[80svh] items-center justify-center pt-28">{children}</section>;
}

// NOTE: this only controls what the interface shows. The real protection is
// Row Level Security in the database (supabase/migrations/0003_rls.sql).
export default function RequireAuth({ admin = false, title, children }) {
  const { isLive, loading, user, profile, isAdmin, isSuspended } = useAuth();
  const location = useLocation();

  if (!isLive) {
    return (
      <>
        <Seo title={title} />
        <Shell>
          <div className="max-w-xl">
            <EmptyState icon={Database} title="Database not connected" text="Accounts, uploads and admin tools need your free Supabase project. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and restart. The README has the step-by-step guide.">
              <Button to="/explore" variant="ghost">Back to the museum</Button>
            </EmptyState>
          </div>
        </Shell>
      </>
    );
  }
  if (loading || (user && !profile)) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (isSuspended) {
    return (
      <Shell>
        <div className="max-w-xl"><EmptyState icon={ShieldAlert} title="Account suspended" text="Your account has been suspended by a curator. Please get in touch if you think this is a mistake."><Button to="/contact">Contact us</Button></EmptyState></div>
      </Shell>
    );
  }
  if (admin && !isAdmin) {
    return (
      <Shell>
        <div className="max-w-xl"><EmptyState icon={ShieldAlert} title="Admins only" text="You do not have permission to view this page."><Button to="/">Back to home</Button></EmptyState></div>
      </Shell>
    );
  }
  return children;
}
