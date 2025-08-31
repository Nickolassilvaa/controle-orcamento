import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, empresa?: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário padrão para teste
const DEFAULT_USER: User = {
  id: '1',
  email: 'teste@gmail.com',
  password: '12345678',
  empresa: 'nrdev'
};

// Empresas autorizadas (tenant)
const AUTHORIZED_COMPANIES = ['nrdev'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, empresa?: string): boolean => {
    // Verificar se a empresa é autorizada
    if (!empresa || !AUTHORIZED_COMPANIES.includes(empresa.toLowerCase())) {
      return false;
    }

    if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
      const user = { ...DEFAULT_USER, empresa };
      setUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};