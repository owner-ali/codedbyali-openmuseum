import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Notice from '../components/common/Notice';
import RequireAuth from '../components/common/RequireAuth';
import UploadForm from '../components/artwork/UploadForm';

export default function Upload() {
  return (
    <RequireAuth title="Upload Artwork">
      <Seo title="Upload Artwork" description="Submit your artwork to CodedByAli OpenMuseum. Every submission is reviewed by a curator before it goes public." />
      <PageHero eyebrow="Upload artwork" title="Show the museum what you made." accent={['made.']} description="Every submission is reviewed by a curator before it becomes public." />
      <section className="container-x pb-8">
        <Notice className="mb-8 max-w-3xl">Only JPG, PNG, WebP and GIF images up to 10 MB are accepted. Large images are resized and converted to WebP automatically. Executable files and SVG are always rejected.</Notice>
        <UploadForm />
      </section>
    </RequireAuth>
  );
}
