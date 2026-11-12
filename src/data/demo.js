// ---------------------------------------------------------------------------
// DEMO CONTENT (Phase 1). Everything here is fictional and generated in code.
// In Phase 3+ this file is replaced by Supabase queries. No engagement numbers
// (likes, views, downloads) exist here on purpose.
// ---------------------------------------------------------------------------
import { hashString } from '../lib/seed';
import { slugify } from '../lib/format';

export const CATEGORIES = [
  { slug: 'digital-art', name: 'Digital Art', style: 'grid', blurb: 'Screens, pixels and light.' },
  { slug: 'ai-art', name: 'AI Art', style: 'flow', blurb: 'Machine imagination.' },
  { slug: 'photography', name: 'Photography', style: 'bokeh', blurb: 'Moments held still.' },
  { slug: '3d-art', name: '3D Art', style: 'cubes', blurb: 'Form with depth.' },
  { slug: 'classical-art', name: 'Classical Art', style: 'arch', blurb: 'Timeless foundations.' },
  { slug: 'abstract-art', name: 'Abstract Art', style: 'orbs', blurb: 'Colour without rules.' },
  { slug: 'illustration', name: 'Illustration', style: 'blobs', blurb: 'Stories drawn.' },
  { slug: 'fantasy', name: 'Fantasy', style: 'mountains', blurb: 'Worlds that never were.' },
  { slug: 'architecture', name: 'Architecture', style: 'city', blurb: 'Space, imagined.' },
  { slug: 'pixel-art', name: 'Pixel Art', style: 'pixel', blurb: 'Small squares, big worlds.' },
  { slug: 'sculptures', name: 'Sculptures', style: 'bust', blurb: 'Stone, light, volume.' },
  { slug: 'wallpapers', name: 'Wallpapers', style: 'waves', blurb: 'Art for every screen.' },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0];

export const PALETTES = [
  ['#00E5FF', '#A855F7', '#1b1035'],
  ['#A855F7', '#F472B6', '#12081f'],
  ['#00E5FF', '#7C3AED', '#08162a'],
  ['#F5C26B', '#A855F7', '#160d24'],
  ['#34F5C5', '#00B8FF', '#071a1f'],
  ['#FF6AD5', '#00E5FF', '#1a0b24'],
  ['#E8E4EE', '#7C3AED', '#0d0b16'],
  ['#FF9E7A', '#A855F7', '#1c0e1d'],
];

export const ARTISTS = [
  { name: 'Amara Voss', city: 'Lisbon, Portugal', discipline: 'Digital painter', bio: 'Builds luminous cityscapes from layered light studies. Interested in how neon changes the way we remember streets.' },
  { name: 'Elio Marchetti', city: 'Florence, Italy', discipline: 'Sculptor & 3D artist', bio: 'Trained in classical stone carving, now translating marble traditions into digital sculpture.' },
  { name: 'Nadia Qureshi', city: 'Karachi, Pakistan', discipline: 'AI & generative artist', bio: 'Explores dreamlike gardens grown from code, patterns and long walks along the coast.' },
  { name: 'Kenji Aoyama', city: 'Osaka, Japan', discipline: 'Architectural visualiser', bio: 'Designs imaginary buildings where glass, shadow and silence do most of the talking.' },
  { name: 'Sofia Delacroix', city: 'Lyon, France', discipline: 'Illustrator', bio: 'Draws maps of places that exist only in half-remembered stories.' },
  { name: 'Tariq Haddad', city: 'Amman, Jordan', discipline: 'Fantasy concept artist', bio: 'Paints moonlit worlds, impossible creatures and ancient skies.' },
  { name: 'Mira Okonkwo', city: 'Lagos, Nigeria', discipline: 'Abstract & 3D artist', bio: 'Colour, rhythm and geometry shaped into immersive, tactile scenes.' },
  { name: 'Jonas Lindqvist', city: 'Gothenburg, Sweden', discipline: 'Photographer', bio: 'Chases long exposures, golden hours and the quiet between busy moments.' },
].map((a, i) => ({
  ...a,
  id: i,
  slug: slugify(a.name),
  seed: hashString(a.name),
  palette: PALETTES[(i + 2) % PALETTES.length],
  demo: true,
}));

export const getArtist = (id) => ARTISTS.find((a) => a.id === id) || ARTISTS[0];
export const getArtistBySlug = (slug) => ARTISTS.find((a) => a.slug === slug);

const ASPECTS = ['4/5', '1/1', '3/4', '4/3', '2/3', '5/6'];

const DESCRIPTIONS = {
  'digital-art': 'A study in light and screen glow, built entirely in layers of colour.',
  'ai-art': 'A generative exploration where pattern, probability and imagination meet.',
  photography: 'A frame about timing, patience and the way light falls on ordinary places.',
  '3d-art': 'A 3D composition exploring volume, material and depth.',
  'classical-art': 'A modern reflection on classical form, columns and ancient light.',
  'abstract-art': 'Colour and rhythm in conversation, without a single fixed subject.',
  illustration: 'An illustrated scene that wants to be the first page of a story.',
  fantasy: 'A landscape from a world that only exists in someone’s imagination.',
  architecture: 'An imagined structure that asks how a city could feel different.',
  'pixel-art': 'A small canvas, deliberately limited, carrying a very large mood.',
  sculptures: 'A sculptural study of form, shadow and presence.',
  wallpapers: 'A composition designed to live quietly on a phone or desktop.',
};

const RAW = [
  ['Neon Meridian', 'digital-art', 0, '2026-10-28', ['neon', 'city', 'synthwave']],
  ['Marble Dreams of Tomorrow', 'sculptures', 1, '2026-10-26', ['marble', 'future']],
  ['Latent Garden', 'ai-art', 2, '2026-10-24', ['ai', 'botanical']],
  ['Glass Cathedral at Dusk', 'architecture', 3, '2026-10-21', ['cathedral', 'glass']],
  ['The Last Olympian', 'classical-art', 1, '2026-10-19', ['olympus', 'myth']],
  ['Signal Bloom', 'abstract-art', 4, '2026-10-17', ['abstract', 'colour']],
  ['Orbital Lullaby', 'fantasy', 5, '2026-10-15', ['space', 'dream']],
  ['Cubic Tides', '3d-art', 6, '2026-10-12', ['isometric', '3d']],
  ['Golden Hour, Karachi', 'photography', 7, '2026-10-10', ['street', 'golden-hour']],
  ['Eight-Bit Oracle', 'pixel-art', 2, '2026-10-08', ['pixel', 'retro']],
  ['Paper Moon Cartography', 'illustration', 4, '2026-10-05', ['map', 'moon']],
  ['Violet Static', 'wallpapers', 0, '2026-10-03', ['wallpaper', 'violet']],
  ['Atlas Unbound', 'sculptures', 3, '2026-09-30', ['titan', 'stone']],
  ['Chromatic Weather', 'abstract-art', 6, '2026-09-27', ['storm', 'colour']],
  ['Temple of Unfinished Light', 'classical-art', 1, '2026-09-24', ['temple', 'columns']],
  ['Neural Reverie', 'ai-art', 5, '2026-09-21', ['neural', 'dream']],
  ['Skyline Without End', 'architecture', 7, '2026-09-18', ['skyline', 'night']],
  ['Moonlit Bestiary', 'fantasy', 2, '2026-09-15', ['creatures', 'moon']],
  ['Pixel Harbour', 'pixel-art', 4, '2026-09-12', ['harbour', 'pixel']],
  ['Prism Atrium', '3d-art', 0, '2026-09-09', ['prism', 'interior']],
  ['Long Exposure, Lahore', 'photography', 7, '2026-09-06', ['night', 'long-exposure']],
  ['Inkwell Constellations', 'illustration', 5, '2026-09-03', ['ink', 'stars']],
  ['Gradient Horizon', 'wallpapers', 6, '2026-08-30', ['gradient', 'minimal']],
  ['Circuit Saints', 'digital-art', 3, '2026-08-27', ['cyber', 'icon']],
];

// Real images: drop .jpg / .png / .webp files into src/assets/artworks/ and they replace the
// generated art automatically (2D gallery and 3D museum). A file named exactly like an artwork
// slug (e.g. neon-oracle.jpg) is matched to that artwork; all other files are assigned in
// alphabetical order to the artworks that have no match. Use only images you own or that are
// public domain / CC0 (for example from Wikimedia Commons or Unsplash).
const LOCAL = import.meta.glob('../assets/artworks/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
const LOCAL_FILES = Object.entries(LOCAL)
  .map(([path, url]) => ({ name: path.split('/').pop().replace(/\.[^.]+$/, ''), url }))
  .sort((a, b) => a.name.localeCompare(b.name));
const bySlug = new Map(LOCAL_FILES.map((f) => [slugify(f.name), f.url]));
const spare = LOCAL_FILES.filter((f) => !RAW.some((r) => slugify(r[0]) === slugify(f.name))).map((f) => f.url);
let spareIdx = 0;

export const ARTWORKS = RAW.map(([title, category, artistId, createdAt, tags], i) => {
  const artist = ARTISTS[artistId];
  const own = bySlug.get(slugify(title));
  const imageUrl = own || (spareIdx < spare.length ? spare[spareIdx++] : undefined);
  return {
    imageUrl,
    id: i,
    slug: slugify(title),
    title,
    category,
    artistId,
    createdAt,
    tags,
    description: DESCRIPTIONS[category],
    seed: hashString(title),
    palette: PALETTES[i % PALETTES.length],
    aspect: ASPECTS[(i * 5 + 1) % ASPECTS.length],
    alt: imageUrl ? `${title}, credited to ${artist.name}` : `${title}, a generative demo artwork in the ${getCategory(category).name} category, credited to ${artist.name}`,
    license: imageUrl ? 'See image source' : 'CC0 demo placeholder',
    free: true,
    demo: true,
  };
});

export const getArtwork = (slug) => ARTWORKS.find((a) => a.slug === slug);
export const artworksByArtist = (artistId) => ARTWORKS.filter((a) => a.artistId === artistId);
export const artworksByIds = (ids) => ids.map((i) => ARTWORKS[i]).filter(Boolean);

export const FEATURED_IDS = [0, 1, 2, 4, 6, 8, 3];
export const TRENDING_IDS = [4, 0, 6, 2, 1];

export const EXHIBITIONS = [
  { title: 'The Universe Beyond', style: 'planet', palette: PALETTES[2], artworks: [6, 7, 13, 21, 15, 22], start: '2026-12-01', end: '2027-02-28', subtitle: 'Cosmos, myth and the infinite.', description: 'A journey outward: nebulae, orbits and quiet planets imagined by artists who look up. The exhibition treats the night sky as the oldest gallery in the world.', curator: 'Imagining space as a place we already belong to.' },
  { title: 'Ancient Legends', style: 'arch', palette: PALETTES[3], artworks: [4, 14, 12, 1, 17], start: '2026-12-10', end: '2027-03-15', subtitle: 'Marble, myth and memory.', description: 'Classical form returns in new light. Columns, titans and temples reinterpreted for a digital century.', curator: 'What survives when stories outlive the stones that held them?' },
  { title: 'Future Architecture', style: 'city', palette: PALETTES[4], artworks: [3, 16, 19, 23], start: '2027-01-05', end: '2027-04-05', subtitle: 'Buildings that have not happened yet.', description: 'Glass cathedrals, endless skylines and impossible interiors from artists who design with imagination first.', curator: 'Cities as a medium for hope.' },
  { title: 'Digital Dreams', style: 'grid', palette: PALETTES[0], artworks: [0, 11, 9, 18, 23], start: '2027-01-20', end: '2027-04-20', subtitle: 'Neon, pixels and screen glow.', description: 'From the small squares of pixel art to luminous digital paintings, a celebration of art born on screens.', curator: 'The screen as a window, not a wall.' },
  { title: 'Colors of Humanity', style: 'blobs', palette: PALETTES[5], artworks: [5, 8, 10, 20, 21], start: '2027-02-10', end: '2027-05-10', subtitle: 'Faces, places and feeling.', description: 'Photography, illustration and abstract colour exploring what it means to share a planet.', curator: 'Colour as a common language.' },
  { title: 'AI Imagination', style: 'flow', palette: PALETTES[1], artworks: [2, 15, 9, 17], start: '2027-03-01', end: '2027-06-01', subtitle: 'Where code starts to dream.', description: 'Artists working with generative systems explore the edge between pattern and poetry.', curator: 'A tool, a collaborator, a question.' },
].map((e, i) => ({
  ...e,
  id: i,
  slug: slugify(e.title),
  seed: hashString(e.title),
  status: 'published',
  demo: true,
}));

export const getExhibition = (slug) => EXHIBITIONS.find((e) => e.slug === slug);

export const ROOMS = [
  { name: 'Ancient Civilization', slug: 'ancient', tagline: 'Marble, temples and myth.', palette: PALETTES[3], artworks: [4, 14, 12, 1, 17] },
  { name: 'Modern Art', slug: 'modern', tagline: 'Colour, form and nerve.', palette: PALETTES[5], artworks: [5, 13, 10, 21, 22] },
  { name: 'Digital Universe', slug: 'digital', tagline: 'Neon, pixels and light.', palette: PALETTES[0], artworks: [0, 11, 9, 23, 19] },
  { name: 'Space & Fantasy', slug: 'space', tagline: 'Worlds beyond the horizon.', palette: PALETTES[2], artworks: [6, 17, 7, 3, 16] },
  { name: 'AI Creations', slug: 'ai', tagline: 'Machine dreams.', palette: PALETTES[1], artworks: [2, 15, 18, 20, 8] },
  { name: 'Abstract World', slug: 'abstract', tagline: 'Pure rhythm and tone.', palette: PALETTES[6], artworks: [5, 13, 22, 11, 7] },
];