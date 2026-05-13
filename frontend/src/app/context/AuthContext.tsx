import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'applicant' | 'recruiter';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'applicant' | 'recruiter') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string, role: 'applicant' | 'recruiter') => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        email,
        password,
      });
      
      const user: User = {
        id: response.data.user_id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('user_role', response.data.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
