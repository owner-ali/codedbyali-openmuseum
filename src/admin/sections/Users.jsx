import { useState } from 'react';
import { Link } from 'react-router-dom';
import Notice from '../../components/common/Notice';
import { useAuth } from '../../context/AuthContext';
import { listUsers, setUserFlags } from '../../services/admin';
import { formatDate } from '../../lib/format';
import { Btn, Loading, Pill, useLoad } from '../ui';

export default function Users() {
  const { user } = useAuth();
  const { data, setData, error } = useLoad(listUsers);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const change = async (p, patch, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      const updated = await setUserFlags(p.id, patch);
      setData((list) => list.map((x) => (x.id === p.id ? updated : x)));
      setMsg('');
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <Loading data={data} error={error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      <label htmlFor="u-search" className="sr-only">Search members</label>
      <input id="u-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or username" className="mb-5 h-12 w-full max-w-md border border-white/15 bg-white/[0.03] px-4 text-base outline-none placeholder:text-white/30 focus:border-neon" />
      <ul className="divide-y divide-white/10 border border-white/10">
        {data
          .filter((p) => !q || `${p.display_name} ${p.username}`.toLowerCase().includes(q.toLowerCase()))
          .map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold"><Link to={`/artists/${p.username}`} className="hover:text-neon">{p.display_name || p.username}</Link></p>
                <p className="text-sm text-muted">@{p.username} · joined {formatDate(p.created_at.slice(0, 10))}</p>
                <div className="mt-2 flex gap-2">{p.role === 'admin' && <Pill tone="ok">admin</Pill>}{p.is_suspended && <Pill tone="bad">suspended</Pill>}</div>
              </div>
              {p.id !== user.id && (
                <div className="flex flex-wrap gap-2">
                  <Btn onClick={() => change(p, { is_suspended: !p.is_suspended }, p.is_suspended ? null : `Suspend ${p.username}? They will no longer be able to post.`)}>{p.is_suspended ? 'Restore' : 'Suspend'}</Btn>
                  <Btn onClick={() => change(p, { role: p.role === 'admin' ? 'user' : 'admin' }, `Change ${p.username} to ${p.role === 'admin' ? 'a normal user' : 'an ADMIN'}?`)}>{p.role === 'admin' ? 'Remove admin' : 'Make admin'}</Btn>
                </div>
              )}
            </li>
          ))}
      </ul>
    </Loading>
  );
}
