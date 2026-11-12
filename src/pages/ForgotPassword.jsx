import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
import Field from '../components/common/Field';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import AuthShell from './auth/AuthShell';
import { useAuth } from '../context/AuthContext';
import { isEmail } from '../lib/validators';

export default function ForgotPassword() {
  const { isLive, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address.');
    setError('');
    setBusy(true);
    const { error: err } = await resetPassword(email.trim());
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <>
      <Seo title="Forgot password" description="Reset your CodedByAli OpenMuseum password." />
      <AuthShell title="Reset password." subtitle="Enter your email and we will send a reset link." footer={<>Remembered it? <Link to="/login" className="text-neon hover:underline">Back to log in</Link></>}>
        {!isLive && <Notice className="mb-5">The database is not connected, so password reset is disabled.</Notice>}
        {sent ? (
          <Notice tone="success">If an account exists for that email, a reset link is on its way.</Notice>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field id="f-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} autoComplete="email" />
            <Button type="submit" size="lg" className="w-full" wrapperClassName="block" disabled={busy || !isLive}>{busy ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
