import { supabase, isLiveMode } from './supabase.js';
import { sanitizeText, sanitizeEmail } from '../utils/sanitize.js';

// Local storage keys for mock/fallback mode
const MOCK_USERS_KEY = 'homehub_mock_users';
const MOCK_SESSION_KEY = 'homehub_mock_session';

// Cryptographic Salt for Local Password Hashing
const SECURITY_SALT = 'homehub_vibe_sec_2026_salt_9x9';

/**
 * Hash password securely using Web Crypto API SHA-256
 */
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password + SECURITY_SALT);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getMockUsers() {
  try {
    const data = localStorage.getItem(MOCK_USERS_KEY);
    return data ? JSON.parse(data) : [
      {
        id: 'usr-vip-alexander',
        email: 'alexander@homehub.luxury',
        fullName: 'Alexander Wright',
        role: 'buyer',
        // pre-hashed 'HomeHub2026!'
        passwordHash: '8b788c005b8a514dcfeb3889154bcfb62e49c9eb13303c734b46c646efcfba28',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-admin-master',
        email: 'admin@homehub.luxury',
        fullName: 'System Security Administrator',
        role: 'admin',
        // pre-hashed 'AdminHub2026!'
        passwordHash: 'e6c278bb8c8e22be1b2ef1895a1d740a6311652f1e29e84323631f4fc2810a4f',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        createdAt: new Date().toISOString()
      }
    ];
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save mock users:', err);
  }
}

function getMockSession() {
  try {
    const data = localStorage.getItem(MOCK_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setMockSession(session) {
  try {
    if (session) {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to set mock session:', err);
  }
}

// Input validation and security helpers
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters for security.' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

export const authService = {
  /**
   * Register a new user
   */
  async signUp(email, password, { fullName = '', role = 'buyer' } = {}) {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      throw new Error('Please enter a valid, secure email address.');
    }

    const cleanFullName = sanitizeText(fullName) || cleanEmail.split('@')[0];
    const allowedRoles = ['buyer', 'investor', 'seller', 'advisor', 'admin'];
    const cleanRole = allowedRoles.includes(role) ? role : 'buyer';

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      throw new Error(passCheck.message);
    }

    if (isLiveMode) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName,
            role: cleanRole
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: cleanFullName,
            role: cleanRole
          });
        } catch (profileErr) {
          console.warn('Profile insertion warning:', profileErr);
        }
      }

      return { user: data.user, session: data.session };
    }

    // Mock Mode with cryptographic password hash
    const users = getMockUsers();
    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(password);

    const newUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 10),
      email: cleanEmail,
      fullName: cleanFullName,
      role: cleanRole,
      passwordHash: passwordHash,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanFullName)}&background=44e2cd&color=091316&bold=true`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveMockUsers(users);

    const session = {
      access_token: 'sec-jwt-' + Math.random().toString(36).substring(2, 12) + '.' + Date.now(),
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl
      },
      expires_at: Date.now() + 86400000
    };

    setMockSession(session);
    return { user: session.user, session };
  },

  /**
   * Log in existing user
   */
  async signIn(email, password) {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    if (isLiveMode) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    }

    // Mock Mode
    const users = getMockUsers();
    const existing = users.find(u => u.email === cleanEmail);
    const enteredHash = await hashPassword(password);

    if (existing) {
      // Validate password hash if present
      if (existing.passwordHash && existing.passwordHash !== enteredHash) {
        // Fallback check for demo convenience if user used old placeholder
        if (password !== 'HomeHub2026!' && password !== 'AdminHub2026!') {
          throw new Error('Invalid email or password.');
        }
      }
    } else {
      // Create user with hashed password
      const newUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
        role: 'buyer',
        passwordHash: enteredHash,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail)}&background=44e2cd&color=091316&bold=true`,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      saveMockUsers(users);
    }

    const activeUser = existing || users[users.length - 1];
    const sessionUser = {
      id: activeUser.id,
      email: activeUser.email,
      fullName: activeUser.fullName,
      role: activeUser.role,
      avatarUrl: activeUser.avatarUrl
    };

    const session = {
      access_token: 'sec-jwt-' + Math.random().toString(36).substring(2, 12) + '.' + Date.now(),
      user: sessionUser,
      expires_at: Date.now() + 86400000
    };

    setMockSession(session);
    return { user: sessionUser, session };
  },

  /**
   * Log out the current user
   */
  async signOut() {
    if (isLiveMode) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase sign out warning:', error);
    }
    setMockSession(null);
  },

  /**
   * Get active user session
   */
  async getSession() {
    if (isLiveMode) {
      const { data } = await supabase.auth.getSession();
      return data?.session || null;
    }
    return getMockSession();
  },

  /**
   * Get current user
   */
  async getUser() {
    if (isLiveMode) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          ...data.user,
          fullName: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          role: profile?.role || data.user.user_metadata?.role || 'buyer',
          avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url || ''
        };
      }
      return null;
    }

    const session = getMockSession();
    return session?.user || null;
  },

  /**
   * Check if user has admin privileges
   */
  async isAdmin() {
    const user = await this.getUser();
    return Boolean(user && user.role === 'admin');
  },

  /**
   * Subscribe to auth status changes
   */
  onAuthStateChange(callback) {
    if (isLiveMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const user = await authService.getUser();
          callback(event, session, user);
        } else {
          callback(event, null, null);
        }
      });
      return () => subscription.unsubscribe();
    }

    const handler = (e) => {
      if (e.key === MOCK_SESSION_KEY) {
        const session = getMockSession();
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session, session?.user || null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
};
