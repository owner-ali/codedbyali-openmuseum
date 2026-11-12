import { createContext, useContext } from 'react';

export const ArtModalContext = createContext(null);

export function useArtModal() {
  const v = useContext(ArtModalContext);
  if (!v) throw new Error('useArtModal must be used inside <ArtModalProvider>');
  return v;
}
