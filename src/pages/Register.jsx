import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import Field from '../components/common/Field';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import AuthShell from './auth/AuthShell';
import PasswordField from './auth/PasswordField';
import { useAuth } from '../context/AuthContext';
import { isEmail } from '../lib/validators';

export default function Register() {
  const { isLive, user, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    if (!form.agree) e.agree = 'Please accept the Terms and Privacy Policy.';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    const { data, error } = await signUp({ email: form.email.trim(), password: form.password, displayName: form.name.trim() });
    setBusy(false);
    if (error) return setFormError(error.message);
    // If email confirmation is on, there is no session yet.
    if (!data?.session) setSent(true);
  };

  return (
    <>
      <Seo title="Create an account" description="Join CodedByAli OpenMuseum as an artist or visitor." />
      <AuthShell title="Join the museum." subtitle="Create an artist profile and publish your work." footer={<>Already a member? <Link to="/login" className="text-neon hover:underline">Log in</Link></>}>
        {!isLive && <Notice className="mb-5">The database is not connected, so sign-up is disabled. See the README to connect Supabase.</Notice>}
        {sent ? (
          <Notice tone="success">Almost there. We sent a confirmation link to <strong>{form.email}</strong>. Open it, then log in.</Notice>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field id="r-name" label="Display name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" maxLength={60} />
            <Field id="r-email" type="email" label="Email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <PasswordField id="r-pass" label="Password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" hint="At least 8 characters." />
            <PasswordField id="r-conf" label="Confirm password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
                <input type="checkbox" checked={form.agree} onChange={set('agree')} className="mt-1 h-5 w-5 shrink-0 accent-[#00E5FF]" />
                I agree to the Terms &amp; Conditions and Privacy Policy.
              </label>
              {errors.agree && <p role="alert" className="mt-2 text-sm text-red-300">{errors.agree}</p>}
            </div>
            {formError && <p role="alert" className="text-sm text-red-300">{formError}</p>}
            <Button type="submit" size="lg" className="w-full" wrapperClassName="block" disabled={busy || !isLive}>{busy ? 'Creating…' : 'Create account'}</Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
