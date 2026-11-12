import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import Field from '../components/common/Field';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import AuthShell from './auth/AuthShell';
import PasswordField from './auth/PasswordField';
import { useAuth } from '../context/AuthContext';
import { isEmail } from '../lib/validators';

export default function Login() {
  const { isLive, user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (user) navigate(dest, { replace: true });
  }, [user, dest, navigate]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!isEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Enter your password.';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    const { error } = await signIn({ email: form.email.trim(), password: form.password });
    setBusy(false);
    if (error) setFormError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
  };

  return (
    <>
      <Seo title="Log in" description="Log in to your CodedByAli OpenMuseum account." />
      <AuthShell title="Welcome back." subtitle="Log in to manage your artwork and favourites." footer={<>New here? <Link to="/register" className="text-neon hover:underline">Create an account</Link></>}>
        {!isLive && <Notice className="mb-5">The database is not connected, so sign-in is disabled. See the README to connect Supabase.</Notice>}
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field id="l-email" type="email" label="Email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
          <PasswordField id="l-pass" label="Password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
          <div className="text-right"><Link to="/forgot-password" className="text-sm text-white/60 hover:text-neon">Forgot password?</Link></div>
          {formError && <p role="alert" className="text-sm text-red-300">{formError}</p>}
          <Button type="submit" size="lg" className="w-full" wrapperClassName="block" disabled={busy || !isLive}>{busy ? 'Logging in…' : 'Log in'}</Button>
        </form>
      </AuthShell>
    </>
  );
}
