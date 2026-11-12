import Seo from '../components/common/Seo';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page could not be found." />
      <section className="container-x flex min-h-[85svh] flex-col items-center justify-center pt-24 text-center">
        <p className="font-display text-[clamp(6rem,26vw,18rem)] font-bold leading-none tracking-tighter text-gradient">404</p>
        <h1 className="mt-4 font-serif text-3xl sm:text-5xl">This gallery is empty.</h1>
        <p className="mt-4 max-w-md text-white/60">The page you are looking for has moved, or never existed. Let us take you back to the exhibits.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/">Back to home</Button>
          <Button to="/explore" variant="ghost">Explore the museum</Button>
        </div>
      </section>
    </>
  );
}
