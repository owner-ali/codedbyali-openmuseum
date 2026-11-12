import { ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';

export default function LikeButton({ art, className = '' }) {
  const { isLiked, toggleLike, likeCountOf, requiresLogin } = useFavorites();
  const navigate = useNavigate();
  const on = isLiked(art);
  const count = likeCountOf(art);
  return (
    <button
      type="button"
      onClick={() => (requiresLogin ? navigate('/login') : toggleLike(art))}
      aria-pressed={on}
      aria-label={on ? `Unlike ${art.title}` : `Like ${art.title}`}
      className={`flex h-10 items-center gap-2 border border-white/15 bg-ink/60 px-3 text-sm transition-colors hover:border-neon ${on ? 'text-neon' : 'text-white'} ${className}`}
    >
      <ThumbsUp size={16} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      {art.demo ? (on ? 'Liked' : 'Like') : count}
    </button>
  );
}
