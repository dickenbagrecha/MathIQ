import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface MockAuthContextValue {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextValue>({
  isSignedIn: false,
  isLoaded: true,
  userId: null,
  sessionId: null,
  getToken: async () => null,
  signOut: async () => {},
});

export function ClerkProvider({ children }: { children: ReactNode; [key: string]: unknown }) {
  const value = useMemo<MockAuthContextValue>(
    () => ({
      isSignedIn: false,
      isLoaded: true,
      userId: null,
      sessionId: null,
      getToken: async () => null,
      signOut: async () => {},
    }),
    [],
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useAuth(): MockAuthContextValue {
  return useContext(MockAuthContext);
}

export function useUser() {
  const auth = useContext(MockAuthContext);
  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    user: null,
  };
}

export function SignedIn({ children }: { children: ReactNode }) {
  const auth = useContext(MockAuthContext);
  return auth.isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const auth = useContext(MockAuthContext);
  return !auth.isSignedIn ? <>{children}</> : null;
}

export function SignInButton({ children }: { children?: ReactNode; [key: string]: unknown }) {
  return (
    <span
      onClick={() => {
        alert('Authentication is running in safe local offline mode.');
      }}
      style={{ cursor: 'pointer', display: 'inline-block' }}
    >
      {children || <button type="button">Sign In</button>}
    </span>
  );
}

export function SignOutButton({ children }: { children?: ReactNode; [key: string]: unknown }) {
  return (
    <span
      onClick={() => {
        alert('Signed out (local mode).');
      }}
      style={{ cursor: 'pointer', display: 'inline-block' }}
    >
      {children || <button type="button">Sign Out</button>}
    </span>
  );
}

export function UserButton(_props: Record<string, unknown>) {
  return null;
}
