import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Notice from '../../components/common/Notice';
import { adminDeleteComment, listReports, setReportStatus } from '../../services/admin';
import { formatDate } from '../../lib/format';
import { Btn, Loading, Pill, useLoad } from '../ui';

export default function Reports() {
  const { data, setData, error } = useLoad(listReports);
  const [msg, setMsg] = useState('');
  const mark = async (r, status) => {
    try {
      await setReportStatus(r.id, status);
      setData((l) => l.map((x) => (x.id === r.id ? { ...x, status } : x)));
    } catch (e) {
      setMsg(e.message);
    }
  };
  const removeComment = async (r) => {
    if (!window.confirm('Delete the reported comment?')) return;
    try {
      await adminDeleteComment(r.comments.id);
      await mark({ id: r.id }, 'resolved');
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <Loading data={data} error={error}>
      {msg && <Notice className="mb-4">{msg}</Notice>}
      {data && data.length === 0 ? (
        <EmptyState title="No reports" text="Reports from members appear here." />
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {(data || []).map((r) => (
            <li key={r.id} className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2"><Pill tone={r.status === 'open' ? 'warn' : r.status === 'resolved' ? 'ok' : 'muted'}>{r.status}</Pill><span className="text-xs text-muted">by @{r.reporter?.username || 'member'} · {formatDate(r.created_at.slice(0, 10))}</span></div>
              <p className="text-white/85">“{r.reason}”</p>
              {r.artworks && <p className="text-sm text-muted">Artwork: <Link to={`/artwork/${r.artworks.slug}`} className="text-neon hover:underline">{r.artworks.title}</Link></p>}
              {r.comments && <p className="text-sm text-muted">Comment: “{r.comments.body.slice(0, 160)}”</p>}
              {r.status === 'open' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Btn onClick={() => mark(r, 'resolved')}>Mark resolved</Btn>
                  <Btn onClick={() => mark(r, 'dismissed')}>Dismiss</Btn>
                  {r.comments && <Btn danger onClick={() => removeComment(r)}>Delete comment</Btn>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Loading>
  );
}
