/**
 * ResQSense — Supabase Client
 * ============================
 * This module creates and exports the Supabase client for use throughout
 * the frontend. Authentication (signUp, signIn, signOut, session restore)
 * is handled by Supabase Auth — credentials are stored in Supabase's secure
 * auth.users table, never in a local JSON file.
 *
 * To configure:
 *  1. Go to https://supabase.com/dashboard → Your Project → Settings → API
 *  2. Copy "Project URL" and "anon public" key
 *  3. Paste them into your .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase credentials are configured
export const isSupabaseConfigured =
  SUPABASE_URL &&
  SUPABASE_URL !== "https://your-project-id.supabase.co" &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== "your-anon-public-key-here";

// Create the Supabase client (works even without real credentials in demo mode)
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Automatically persist session in localStorage across page refreshes
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "resqsense_auth_session",
      },
    })
  : null;

/**
 * Sign up a new rescue/admin user via Supabase Auth.
 * Uses backend with Supabase Admin to auto-confirm email for seamless access,
 * then initializes client session so user is logged in immediately.
 */
export async function supabaseSignUp({ email, password, role, name, badgeId, agency }) {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  // 1. Try server-assisted signup (auto-confirms email in Supabase)
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, name, badgeId, agency }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    // Immediately establish Supabase client session if client is available
    if (supabase) {
      try {
        const signRes = await supabase.auth.signInWithPassword({ email, password });
        if (signRes.data?.user) return signRes.data;
      } catch { /* proceed with returned profile */ }
    }

    return { user: { id: data.user.id, email: data.user.email, user_metadata: data.user }, session: { access_token: data.token } };
  } catch (backendErr) {
    // 2. Direct client-side Supabase fallback
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: name || (role === "admin" ? "State Dispatcher" : "Rescue Specialist"),
            badgeId: badgeId || ("BDG-" + Math.floor(1000 + Math.random() * 9000)),
            agency: agency || (role === "admin" ? "State Disaster Control Unit" : "District Emergency Response Unit"),
          },
        },
      });
      if (error) throw error;
      return data;
    }
    throw backendErr;
  }
}

/**
 * Sign in an existing rescue/admin user via Supabase Auth.
 * After sign-in, the session is auto-persisted in localStorage.
 */
export async function supabaseSignIn({ email, password }) {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  // 1. Try client-side Supabase signIn
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) return data;
      if (error && !error.message?.includes("fetch")) {
        // If Supabase returned an explicit auth error, try backend fallback in case of unconfirmed email
        console.warn("Supabase client sign-in warning:", error.message);
      }
    } catch (e) {
      console.warn("Supabase client sign-in exception:", e);
    }
  }

  // 2. Server-assisted login fallback
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid credentials");

  return {
    user: { id: data.user.id, email: data.user.email, user_metadata: data.user },
    session: { access_token: data.token }
  };
}

/**
 * Sign out the currently authenticated user.
 */
export async function supabaseSignOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session/user from Supabase.
 * Returns { session, user } or null values if not logged in.
 */
export async function getSupabaseSession() {
  if (!supabase) return { session: null, user: null };
  const { data: { session } } = await supabase.auth.getSession();
  return { session, user: session?.user ?? null };
}

/**
 * Parse a Supabase user object into the ResQSense user profile shape.
 * The role is embedded in user_metadata set during sign-up.
 */
export function parseSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: meta.role || "citizen",
    name: meta.name || supabaseUser.email?.split("@")[0] || "User",
    badgeId: meta.badgeId || "BDG-0000",
    agency: meta.agency || "ResQSense Platform",
    createdAt: supabaseUser.created_at,
  };
}
