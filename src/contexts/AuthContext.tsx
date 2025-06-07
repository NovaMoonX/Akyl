import { type User } from 'firebase/auth';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from '../firebase/config';
import { getUserCryptoKey } from '../lib';

type AuthContextType = {
  currentUser: User | null;
  cryptoKey: CryptoKey | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (!user) {
        setCryptoKey(null);
        return;
      }

      // TASK: remove testing flag
      getUserCryptoKey(user.uid, true)
        .then((key) => {
          if (key) {
            setCryptoKey(key);
          } else {
            console.error('Failed to retrieve crypto key for user:', user.email);
          }
        })
        .catch((error) => {
          console.error('Error fetching crypto key:', error);
          setCryptoKey(null);
        });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, cryptoKey }}>
      {children}
    </AuthContext.Provider>
  );
};
