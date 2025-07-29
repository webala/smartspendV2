import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import type { ApiError } from "@/lib/api-client";

// Auth query keys
export const AUTH_KEYS = {
  profile: ["auth", "profile"] as const,
};

// Hook for user registration
export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Invalidate and refetch profile query
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      // Navigate to dashboard
      navigate("/dashboard");
    },
    onError: (error: ApiError) => {
      console.error("Registration failed:", error);
    },
  });
};

// Hook for user login
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Invalidate and refetch profile query
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
      // Navigate to dashboard
      navigate("/dashboard");
    },
    onError: (error: ApiError) => {
      console.error("Login failed:", error);
    },
  });
};

// Hook for user logout
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(authApi.logout()),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Navigate to login
      navigate("/login");
    },
  });
};

// Hook for getting user profile
export const useProfile = () => {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: authApi.getProfile,
    enabled: authApi.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if ((error as unknown as ApiError)?.status === 401) {
        authApi.logout();
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { data: profile, isLoading, error } = useProfile();

  return {
    isAuthenticated: authApi.isAuthenticated() && !!profile,
    user: profile?.user || authApi.getCurrentUser(),
    isLoading,
    error,
  };
};
