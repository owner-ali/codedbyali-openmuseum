import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import Button from '../components/common/Button';
import { LogoMark } from '../components/common/Logo';

const VALUES = [
  { title: 'Open by design', text: 'Anyone can look. Anyone with something to show can apply to exhibit.' },
  { title: 'Curated, not cluttered', text: 'Submissions are reviewed by people before they go public, so the walls stay worth looking at.' },
  { title: 'Built on free tools', text: 'The museum runs on free, open technology so it can stay open to everyone.' },
  { title: 'Artists first', text: 'Clear attribution and licences, and no tricks. Credit travels with the work.' },
];

export default function About() {
  return (
    <>
      <Seo title="About the Museum" description="CodedByAli OpenMuseum is a digital art museum and artist community built with passion by CodedByAli." />
      <PageHero
        eyebrow="About the museum"
        title="A digital museum, open to everyone."
        accent={['open']}
        description="CodedByAli OpenMuseum exists to put timeless art and emerging creators in the same room, and to make that room free to enter."
      />

      <section className="container-x grid gap-12 py-12 lg:grid-cols-12">
        <Reveal className="space-y-5 text-lg leading-relaxed text-white/70 lg:col-span-7">
          <p>The museum is a place to look slowly. You can wander the collection, step into themed virtual rooms and follow artists whose work you want to see more of.</p>
          <p>It is also a community. Artists create a profile, submit their work for review and share it with visitors around the world. Every piece carries the artist's name and licence.</p>
          <p>The site you are using is an early build. Artwork shown today is generated demo content, clearly labelled, while the community and database are being connected.</p>
        </Reveal>
        <Reveal delay={0.15} className="flex items-center justify-center lg:col-span-5">
          <div className="flex aspect-square w-full max-w-sm items-center justify-center border border-white/10 bg-panel" style={{ background: 'radial-gradient(60% 60% at 50% 40%, rgba(168,85,247,.25), transparent 70%), #101016' }}>
            <LogoMark size={140} />
          </div>
        </Reveal>
      </section>

      <section className="container-x py-12">
        <h2 className="eyebrow mb-8">What we believe</h2>
        <ul className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 0.06} className="bg-ink p-7">
              <h3 className="font-display text-2xl font-bold">{v.title}</h3>
              <p className="mt-3 text-white/60">{v.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="container-x py-12 text-center">
        <p className="font-serif text-3xl italic text-white/80 sm:text-4xl">Created with passion by CodedByAli.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/explore">Explore the museum</Button>
          <Button to="/contact" variant="ghost">Get in touch</Button>
        </div>
      </section>
    </>
  );
}
