import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import axios from "axios";

import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/axios";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  registerCustomer as registerCustomerRequest,
} from "@/services/auth";
import type {
  AuthenticatedUser,
  CustomerRegistrationPayload,
  LoginPayload,
} from "@/types/auth";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>;
  registerCustomer: (
    payload: CustomerRegistrationPayload,
  ) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthenticatedUser> => {
      const response = await loginRequest(payload);

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.data.token);
      setUser(response.data.user);

      return response.data.user;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  const registerCustomer = useCallback(
    async (
      payload: CustomerRegistrationPayload,
    ): Promise<AuthenticatedUser> => {
      const response = await registerCustomerRequest(payload);

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.data.token);
      setUser(response.data.user);

      return response.data.user;
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

      if (!token) {
        if (isActive) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const authenticatedUser = await getCurrentUser();

        if (isActive) {
          setUser(authenticatedUser);
        }
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }

        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      registerCustomer,
      logout,
    }),
    [isLoading, login, logout, registerCustomer, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
