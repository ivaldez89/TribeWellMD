'use client';

import { useEffect, useState, useCallback } from 'react';
import { clearCurrentUserSession, setCurrentUserId, clearLegacyProfileData, getCurrentUserId, loadProfileFromSupabase } from '@/lib/storage/profileStorage';
import { createClient } from '@/lib/supabase/client';

// Create a simple event system for auth state changes
const authListeners = new Set<() => void>();

export function notifyAuthChange() {
  authListeners.forEach(listener => listener());
}

export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    // First check for Supabase session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Check if this is a different user (re-login or first load)
      const currentUserId = getCurrentUserId();
      if (currentUserId !== session.user.id) {
        clearLegacyProfileData();
        // Load profile from Supabase (this also sets the user ID internally)
        loadProfileFromSupabase().catch(err => {
          console.warn('Failed to load profile from cloud:', err);
          // Fallback: at least set the user ID so profile storage works
          setCurrentUserId(session.user.id);
        });
      }
      setIsAuthenticated(true);
      return;
    }

    // Fallback to legacy cookie check
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('tribewellmd-auth='));
    setIsAuthenticated(authCookie?.includes('authenticated') ?? false);
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Re-check on focus (in case user logged in/out in another tab)
    window.addEventListener('focus', checkAuth);

    // Listen for auth changes from sign-out
    authListeners.add(checkAuth);

    // Subscribe to Supabase auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Handle auth state changes (e.g., after OAuth callback)
        const currentUserId = getCurrentUserId();
        if (currentUserId !== session.user.id) {
          clearLegacyProfileData();
          // Load profile from Supabase (this also sets the user ID internally)
          loadProfileFromSupabase().catch(err => {
            console.warn('Failed to load profile from cloud:', err);
            // Fallback: at least set the user ID so profile storage works
            setCurrentUserId(session.user.id);
          });
        }
      }
      setIsAuthenticated(!!session);
    });

    return () => {
      window.removeEventListener('focus', checkAuth);
      authListeners.delete(checkAuth);
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return isAuthenticated;
}

export function signOut() {
  // Clear the auth cookie
  document.cookie = 'tribewellmd-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  // Clear the current user session (so next login gets fresh profile)
  clearCurrentUserSession();
  // Notify all listeners
  notifyAuthChange();
}
