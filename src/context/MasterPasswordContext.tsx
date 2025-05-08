import React, { createContext, useState, useContext } from 'react';

interface MasterPasswordContextProps {
  isAuthenticated: boolean;
  authenticate: (password: string) => boolean;
  setIsAuthenticated: (value: boolean) => void; // Added this property
}

const MasterPasswordContext = createContext<MasterPasswordContextProps | undefined>(undefined);

const MASTER_PASSWORD = 'andreu';

export const MasterPasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticate = (password: string) => {
    if (password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <MasterPasswordContext.Provider value={{ isAuthenticated, authenticate, setIsAuthenticated }}>
      {children}
    </MasterPasswordContext.Provider>
  );
};

export const useMasterPassword = () => {
  const context = useContext(MasterPasswordContext);
  if (!context) {
    throw new Error('useMasterPassword must be used within a MasterPasswordProvider');
  }
  return context;
};