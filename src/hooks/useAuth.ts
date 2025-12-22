'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Create a simple event system for auth state changes
const authListeners = new Set<() => void>();

export function notifyAuthChange() {
  authListeners.forEach(listener => listener());
}

export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setIsAuthenticated(true);
      return;
    }

    // Fallback to legacy cookie check for backwards compatibility
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('tribewellmd-auth='));
    setIsAuthenticated(authCookie?.includes('authenticated') ?? false);
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Subscribe to auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    // Re-check on focus (in case user logged in/out in another tab)
    window.addEventListener('focus', checkAuth);

    // Listen for auth changes from sign-out
    authListeners.add(checkAuth);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', checkAuth);
      authListeners.delete(checkAuth);
    };
  }, [checkAuth]);

  return isAuthenticated;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();

  // Clear the legacy auth cookie too
  document.cookie = 'tribewellmd-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Notify all listeners
  notifyAuthChange();
}
