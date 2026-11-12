import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import { hasBooted } from './lib/boot';

export default function App() {
  // The cinematic loading screen plays once per browser session.
  const [loading, setLoading] = useState(() => !hasBooted());
  const done = useCallback(() => setLoading(false), []);

  return (
    <AuthProvider>
      <CatalogProvider>
        <FavoritesProvider>
          <Layout />
          <AnimatePresence>{loading && <Loader key="loader" onDone={done} />}</AnimatePresence>
        </FavoritesProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
