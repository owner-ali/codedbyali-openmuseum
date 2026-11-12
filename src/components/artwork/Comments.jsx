import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Notice from '../common/Notice';
import { useAuth } from '../../context/AuthContext';
import { addComment, deleteComment, fetchComments, reportItem } from '../../services/community';
import { formatDate } from '../../lib/format';

export default function Comments({ art }) {
  const { user, isAdmin, isSuspended } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!art.demo);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (art.demo) return;
    setLoading(true);
    try {
      setItems(await fetchComments(art.id));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load comments.');
    } finally {
      setLoading(false);
    }
  }, [art]);

  useEffect(() => {
    load();
  }, [load]);

  if (art.demo) {
    return (
      <div className="border border-white/10 bg-panel p-6">
        <p className="text-white/70">Comments are available on real artwork once the database is connected.</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 1 || busy) return;
    setBusy(true);
    setError('');
    try {
      const c = await addComment(art.id, user.id, text);
      setItems((x) => [...x, c]);
      setText('');
    } catch (err) {
      setError(err.message || 'Could not post your comment.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteComment(id);
      setItems((x) => x.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message || 'Could not delete the comment.');
    }
  };

  const report = async (id) => {
    const reason = window.prompt('Why are you reporting this comment?');
    if (!reason || reason.trim().length < 3) return;
    try {
      await reportItem({ reporterId: user.id, commentId: id, reason });
      setNote('Thank you. A curator will review this comment.');
    } catch (err) {
      setError(err.message || 'Could not send the report.');
    }
  };

  return (
    <div>
      {error && <Notice className="mb-4">{error}</Notice>}
      {note && <Notice tone="success" className="mb-4">{note}</Notice>}

      {user && !isSuspended ? (
        <form onSubmit={submit} className="mb-8">
          <label htmlFor="comment-body" className="sr-only">Write a comment</label>
          <textarea
            id="comment-body"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Share what this piece makes you feel"
            className="w-full border border-white/15 bg-white/[0.03] p-4 text-base outline-none placeholder:text-white/30 focus:border-neon"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">{text.length}/1000</span>
            <Button type="submit" size="sm" disabled={busy || !text.trim()}>{busy ? 'Posting…' : 'Post comment'}</Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 border border-white/10 bg-panel p-6">
          <p className="text-white/70">{isSuspended ? 'Your account is suspended and cannot comment.' : 'Log in to join the conversation.'}</p>
          {!user && (
            <div className="mt-4 flex gap-3">
              <Button to="/login" size="sm">Log in</Button>
              <Button to="/register" size="sm" variant="ghost">Create account</Button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading comments…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Be the first.</p>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm">
                  {c.profiles?.username ? <Link to={`/artists/${c.profiles.username}`} className="font-semibold hover:text-neon">{c.profiles.display_name || c.profiles.username}</Link> : <span className="font-semibold">Member</span>}
                  <span className="ml-2 text-xs text-muted">{formatDate((c.created_at || '').slice(0, 10))}</span>
                  {c.is_hidden && <span className="ml-2 text-xs text-amber-300">(hidden)</span>}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-white/75">{c.body}</p>
              </div>
              {user && (
                <div className="flex shrink-0 gap-1">
                  {(c.user_id === user.id || isAdmin) && (
                    <button type="button" onClick={() => remove(c.id)} aria-label="Delete comment" className="flex h-10 w-10 items-center justify-center text-muted hover:text-red-300"><Trash2 size={16} /></button>
                  )}
                  {c.user_id !== user.id && (
                    <button type="button" onClick={() => report(c.id)} aria-label="Report comment" className="flex h-10 w-10 items-center justify-center text-muted hover:text-neon"><Flag size={16} /></button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
