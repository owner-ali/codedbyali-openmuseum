import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoriteButton({ art, className = '', size = 18 }) {
  const { isFavorite, toggleFavorite, requiresLogin } = useFavorites();
  const navigate = useNavigate();
  const on = isFavorite(art);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (requiresLogin) navigate('/login');
        else toggleFavorite(art);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${art.title} from favorites` : `Save ${art.title} to favorites`}
      className={`flex h-10 w-10 items-center justify-center border border-white/15 bg-ink/60 backdrop-blur transition-colors hover:border-neon ${on ? 'text-neon' : 'text-white'} ${className}`}
    >
      <Heart size={size} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
