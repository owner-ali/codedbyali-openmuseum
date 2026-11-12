import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import AuthShell from './auth/AuthShell';
import PasswordField from './auth/PasswordField';
import { useAuth } from '../context/AuthContext';

// Supabase signs the user in from the email link, then this page sets a new password.
export default function ResetPassword() {
  const { isLive, user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [conf, setConf] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (pw.length < 8) return setError('Use at least 8 characters.');
    if (pw !== conf) return setError('Passwords do not match.');
    setError('');
    setBusy(true);
    const { error: err } = await updatePassword(pw);
    setBusy(false);
    if (err) return setError(err.message);
    setDone(true);
    setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
  };

  return (
    <>
      <Seo title="Choose a new password" description="Set a new password for your CodedByAli OpenMuseum account." />
      <AuthShell title="New password." subtitle="Choose a strong password you have not used before." footer={<Link to="/login" className="text-neon hover:underline">Back to log in</Link>}>
        {!isLive ? (
          <Notice>The database is not connected.</Notice>
        ) : done ? (
          <Notice tone="success">Password updated. Taking you to your dashboard…</Notice>
        ) : !loading && !user ? (
          <Notice>This reset link is invalid or has expired. <Link to="/forgot-password" className="text-neon underline">Request a new one</Link>.</Notice>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <PasswordField id="n-pass" label="New password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            <PasswordField id="n-conf" label="Confirm password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" />
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <Button type="submit" size="lg" className="w-full" wrapperClassName="block" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
