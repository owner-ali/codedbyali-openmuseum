import { useState } from 'react';
import Field from '../../components/common/Field';
import Button from '../../components/common/Button';
import Notice from '../../components/common/Notice';
import { useCatalog } from '../../context/CatalogContext';
import { deleteCategory, listCategories, saveCategory } from '../../services/admin';
import { Btn, Loading, useLoad } from '../ui';

const blank = { name: '', slug: '', description: '', sort_order: 0 };

export default function Categories() {
  const { refresh } = useCatalog();
  const { data, reload, error } = useLoad(listCategories);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setMsg('Enter a category name.');
    try {
      await saveCategory(form);
      setForm(blank);
      setMsg('');
      await reload();
      refresh();
    } catch (err) {
      setMsg(err.code === '23505' ? 'That slug already exists.' : err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? Categories that still contain artwork cannot be deleted.`)) return;
    try {
      await deleteCategory(c.id);
      await reload();
      refresh();
    } catch (err) {
      setMsg(err.code === '23503' ? 'This category still has artwork. Move or delete it first.' : err.message);
    }
  };

  return (
    <Loading data={data} error={error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      <form onSubmit={submit} className="mb-8 grid gap-4 border border-white/10 bg-panel p-5 sm:grid-cols-2">
        <h3 className="font-display text-lg font-bold sm:col-span-2">{form.id ? 'Edit category' : 'Add category'}</h3>
        <Field id="c-name" label="Name" value={form.name} onChange={set('name')} maxLength={60} />
        <Field id="c-slug" label="Slug (optional)" value={form.slug} onChange={set('slug')} hint="Used in links. Leave empty to generate." />
        <Field id="c-desc" label="Description" value={form.description || ''} onChange={set('description')} />
        <Field id="c-order" type="number" label="Sort order" value={form.sort_order} onChange={set('sort_order')} />
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit">{form.id ? 'Save category' : 'Add category'}</Button>
          {form.id && <Button variant="ghost" onClick={() => setForm(blank)}>Cancel</Button>}
        </div>
      </form>
      <ul className="divide-y divide-white/10 border border-white/10">
        {data.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0"><p className="font-display text-lg font-bold">{c.name}</p><p className="text-sm text-muted">/{c.slug} · order {c.sort_order}</p></div>
            <div className="flex gap-2"><Btn onClick={() => setForm({ ...c, description: c.description || '' })}>Edit</Btn><Btn danger onClick={() => remove(c)}>Delete</Btn></div>
          </li>
        ))}
      </ul>
    </Loading>
  );
}
