import ArtCard from './ArtCard';

export default function MasonryGallery({ items }) {
  return (
    <div className="columns-1 gap-4 min-[480px]:columns-2 lg:columns-3 2xl:columns-4">
      {items.map((art) => (
        <div key={art.id} className="mb-4 break-inside-avoid">
          <ArtCard art={art} list={items} />
        </div>
      ))}
    </div>
  );
}
