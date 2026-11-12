import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Notice from '../components/common/Notice';

export default function LegalPage({ title, seoTitle, description, updated, sections }) {
  return (
    <>
      <Seo title={seoTitle} description={description} />
      <PageHero eyebrow="Legal" title={title} description={`Last updated ${updated}.`} />
      <section className="container-x pb-8">
        <Notice className="mb-10 max-w-3xl">Starter text for an early build. Have it reviewed against the laws that apply to you before you launch publicly.</Notice>
        <div className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <article key={s.h}>
              <h2 className="font-display text-2xl font-bold">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-white/65">{s.p}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
