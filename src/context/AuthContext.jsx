import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isLive, supabase } from '../lib/supabase';

const AuthCtx = createContext(null);
const NOT_CONFIGURED = { error: { message: 'The database is not connected yet. Add your Supabase keys to .env (see README).' } };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isLive);

  const loadProfile = useCallback(async (uid) => {
    if (!supabase || !uid) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => alive && setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // defer to avoid deadlocks inside the auth callback
      setTimeout(() => loadProfile(s?.user?.id), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      isLive,
      loading,
      session,
      user: session?.user || null,
      profile,
      isAdmin: profile?.role === 'admin' && !profile?.is_suspended,
      isSuspended: !!profile?.is_suspended,
      refreshProfile: () => loadProfile(session?.user?.id),
      async signUp({ email, password, displayName }) {
        if (!supabase) return NOT_CONFIGURED;
        return supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin },
        });
      },
      async signIn({ email, password }) {
        if (!supabase) return NOT_CONFIGURED;
        return supabase.auth.signInWithPassword({ email, password });
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
      },
      async resetPassword(email) {
        if (!supabase) return NOT_CONFIGURED;
        return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      },
      async updatePassword(password) {
        if (!supabase) return NOT_CONFIGURED;
        return supabase.auth.updateUser({ password });
      },
    }),
    [loading, session, profile, loadProfile],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}
