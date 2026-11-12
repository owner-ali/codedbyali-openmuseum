import Navbar from './Navbar';
import Footer from './Footer';
import Cursor from '../common/Cursor';
import ScrollToTop from '../common/ScrollToTop';
import ArtModalProvider from '../../context/ArtModalProvider';
import AppRoutes from '../../routes/AppRoutes';

export default function Layout() {
  return (
    <ArtModalProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="min-h-[70svh]">
        <AppRoutes />
      </main>
      <Footer />
      <Cursor />
    </ArtModalProvider>
  );
}
