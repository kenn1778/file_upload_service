import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'google_auth_token';
const USER_KEY = 'google_user_info';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string> | null;
}

const AuthContext = createContext<AuthContextType>(null!);

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri(),
  });

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken || response.params?.access_token;
      if (token) {
        setAccessToken(token);
        fetchUserInfo(token);
      }
    }
  }, [response]);

  async function restoreSession() {
    try {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedUser = await SecureStore.getItemAsync(USER_KEY);
      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // no saved session
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUserInfo(token: string) {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const info: UserInfo = await res.json();
      setUser(info);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(info));
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      Alert.alert('Error', 'Could not fetch user profile');
    }
  }

  const signInWithGoogle = useCallback(async () => {
    try {
      await promptAsync();
    } catch (err) {
      console.error('Google sign-in error:', err);
      Alert.alert('Sign In Failed', 'Could not sign in with Google');
    }
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }, []);

  function getAuthHeaders(): Record<string, string> | null {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
