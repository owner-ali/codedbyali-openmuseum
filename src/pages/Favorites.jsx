import { Heart } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import MasonryGallery from '../components/gallery/MasonryGallery';
import { useCatalog } from '../context/CatalogContext';
import { useFavorites, keyArt } from '../context/FavoritesContext';

export default function Favorites() {
  const { favorites, requiresLogin } = useFavorites();
  const { artworks, isLive } = useCatalog();
  const items = artworks.filter((a) => favorites.includes(keyArt(a)));
  return (
    <>
      <Seo title="Favorites" description="Artwork you have saved at CodedByAli OpenMuseum." />
      <PageHero eyebrow="Favorites" title="Your private collection." accent={['collection.']} description="Tap the heart on any artwork to save it here." />
      <section className="container-x pb-8">
        {!isLive && <Notice className="mb-8">Demo mode: favorites are saved on this device only.</Notice>}
        {requiresLogin ? (
          <EmptyState icon={Heart} title="Log in to see your favorites" text="Favorites are saved to your account so they follow you across devices.">
            <Button to="/login">Log in</Button>
            <Button to="/register" variant="ghost">Create account</Button>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState icon={Heart} title="No favorites yet" text="Browse the museum and tap the heart on anything that moves you.">
            <Button to="/explore">Explore the museum</Button>
          </EmptyState>
        ) : (
          <MasonryGallery items={items} />
        )}
      </section>
    </>
  );
}
