import { useState } from 'react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Field from '../components/common/Field';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import { isEmail } from '../lib/validators';
import { useCatalog } from '../context/CatalogContext';

const ENV_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || '').trim();

export default function Contact() {
  const { settings } = useCatalog();
  const CONTACT_EMAIL = (typeof settings.contact_email === 'string' && settings.contact_email.trim()) || ENV_EMAIL;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | opened | unconfigured
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'Write at least 10 characters.';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!CONTACT_EMAIL) {
      setState('unconfigured');
      return;
    }
    const subject = encodeURIComponent(`OpenMuseum message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} <${form.email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setState('opened');
  };

  return (
    <>
      <Seo title="Contact" description="Get in touch with the CodedByAli OpenMuseum team." />
      <PageHero eyebrow="Contact" title="Say hello." accent={['hello.']} description="Questions, feedback or ideas for the museum? Write to us." />
      <section className="container-x pb-8">
        <div className="grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <Field id="c-name" label="Your name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
            <Field id="c-email" type="email" label="Email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <Field id="c-msg" as="textarea" rows={6} label="Message" value={form.message} onChange={set('message')} error={errors.message} />
            <Button type="submit" size="lg" className="w-full sm:w-auto">Send message</Button>
            {state === 'opened' && <Notice tone="success">Your email app should have opened with the message ready to send.</Notice>}
            {state === 'unconfigured' && (
              <Notice>
                Your message is valid, but no contact email is configured yet, so nothing was sent. An admin can set the contact email in Admin, Site settings (or set <code>VITE_CONTACT_EMAIL</code> in .env).
              </Notice>
            )}
          </form>
          <aside className="border border-white/10 bg-panel p-6 text-sm leading-relaxed text-white/65">
            <h2 className="mb-3 font-display text-xl font-bold text-white">Good to know</h2>
            <p>We read every message, but replies can take a few days while the museum is in early build.</p>
            <p className="mt-3">Found a problem with an artwork or comment? Use the flag button next to it to report it to a curator.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
