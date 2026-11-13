
import { createContext, useContext, useState } from 'react';
import { logoutUser } from '../services/authApi.js';

const AuthContext = createContext(null);

// The login is saved in the browser so a refresh or coming back from
// the Moyasar payment page doesn't log the user out
function getSavedAuth() {
  try {
    return JSON.parse(localStorage.getItem('wesal-auth')) || {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const savedAuth = getSavedAuth();
  const [user, setUser] = useState(savedAuth.user || null);
  const [tokens, setTokens] = useState(savedAuth.tokens || null);
  const [profile, setProfile] = useState(null);

  const login = (userData, userTokens) => {
    setUser(userData);
    setTokens(userTokens);
    localStorage.setItem('wesal-auth', JSON.stringify({ user: userData, tokens: userTokens }));
  };

  const clearAuth = () => {
    setUser(null);
    setTokens(null);
    setProfile(null);
    localStorage.removeItem('wesal-auth');
  };

  const logout = async () => {
    if (!tokens?.access || !tokens?.refresh) {
      clearAuth();
      return true;
    }

    try {
      await logoutUser(tokens.access, tokens.refresh);
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Log out on this device even if the backend call failed (for example an expired token)
    clearAuth();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        profile,
        setProfile,
        isLoggedIn: Boolean(user && tokens?.access),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
