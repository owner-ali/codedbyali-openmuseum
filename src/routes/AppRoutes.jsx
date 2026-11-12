import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import PageFallback from '../components/common/PageFallback';

// Route-based code splitting: every page is its own chunk.
const Home = lazy(() => import('../pages/Home'));
const Explore = lazy(() => import('../pages/Explore'));
const VirtualMuseum = lazy(() => import('../pages/VirtualMuseum'));
const Store = lazy(() => import('../pages/Store'));
const Exhibitions = lazy(() => import('../pages/Exhibitions'));
const ExhibitionDetail = lazy(() => import('../pages/ExhibitionDetail'));
const Artists = lazy(() => import('../pages/Artists'));
const ArtistProfile = lazy(() => import('../pages/ArtistProfile'));
const ArtworkDetails = lazy(() => import('../pages/ArtworkDetails'));
const Upload = lazy(() => import('../pages/Upload'));
const Favorites = lazy(() => import('../pages/Favorites'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const ArtistDashboard = lazy(() => import('../artist/ArtistDashboard'));
const AdminDashboard = lazy(() => import('../admin/AdminDashboard'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/virtual-museum" element={<VirtualMuseum />} />
            <Route path="/store" element={<Store />} />
            <Route path="/exhibitions" element={<Exhibitions />} />
            <Route path="/exhibitions/:slug" element={<ExhibitionDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:slug" element={<ArtistProfile />} />
            <Route path="/artwork/:slug" element={<ArtworkDetails />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ArtistDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
}
