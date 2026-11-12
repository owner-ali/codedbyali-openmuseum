import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Notice from '../../components/common/Notice';
import { adminDeleteComment, listAllComments, setCommentHidden } from '../../services/admin';
import { formatDate } from '../../lib/format';
import { Btn, Loading, Pill, useLoad } from '../ui';

export default function Comments() {
  const { data, setData, error } = useLoad(listAllComments);
  const [msg, setMsg] = useState('');
  const toggle = async (c) => {
    try {
      await setCommentHidden(c.id, !c.is_hidden);
      setData((l) => l.map((x) => (x.id === c.id ? { ...x, is_hidden: !c.is_hidden } : x)));
    } catch (e) {
      setMsg(e.message);
    }
  };
  const remove = async (c) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await adminDeleteComment(c.id);
      setData((l) => l.filter((x) => x.id !== c.id));
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <Loading data={data} error={error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      {data && data.length === 0 ? (
        <EmptyState title="No comments" text="Member comments appear here for moderation." />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {(data || []).map((c) => (
            <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">@{c.profiles?.username || 'member'} on {c.artworks ? <Link to={`/artwork/${c.artworks.slug}`} className="text-neon hover:underline">{c.artworks.title}</Link> : 'removed artwork'} · {formatDate(c.created_at.slice(0, 10))} {c.is_hidden && <Pill tone="warn">hidden</Pill>}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-white/80">{c.body}</p>
              </div>
              <div className="flex gap-2"><Btn onClick={() => toggle(c)}>{c.is_hidden ? 'Unhide' : 'Hide'}</Btn><Btn danger onClick={() => remove(c)}>Delete</Btn></div>
            </li>
          ))}
        </ul>
      )}
    </Loading>
  );
}
