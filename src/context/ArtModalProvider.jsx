import { useCallback, useMemo, useState } from 'react';
import { ArtModalContext } from './ArtModalContext';
import ArtModal from '../components/gallery/ArtModal';

export default function ArtModalProvider({ children }) {
  const [state, setState] = useState(null);

  const open = useCallback((art, list) => setState({ art, list: list && list.length ? list : [art] }), []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback((dir) => {
    setState((s) => {
      if (!s) return s;
      const i = s.list.findIndex((a) => a.id === s.art.id);
      const next = s.list[(i + dir + s.list.length) % s.list.length];
      return { ...s, art: next };
    });
  }, []);

  const value = useMemo(
    () => ({ active: state ? state.art : null, list: state ? state.list : [], open, close, step }),
    [state, open, close, step],
  );

  return (
    <ArtModalContext.Provider value={value}>
      {children}
      <ArtModal />
    </ArtModalContext.Provider>
  );
}
