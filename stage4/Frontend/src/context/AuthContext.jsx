
import { createContext, useContext, useState } from 'react';
import { logoutUser } from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);

  const login = (userData, userTokens) => {
    setUser(userData);
    setTokens(userTokens);
  };

  const logout = async () => {
    if (!tokens?.access || !tokens?.refresh) {
      return false;
    }

    try {
      const result = await logoutUser(tokens.access, tokens.refresh);

      if (result.success) {
        setUser(null);
        setTokens(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
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
