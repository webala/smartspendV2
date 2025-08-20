import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  dashboardApi,
  DashboardData,
  DashboardAnalytics,
} from "@/api/dashboard";
import { useToast } from "@/hooks/use-toast";
import type { ApiError } from "@/lib/api-client";

// Dashboard query keys
export const DASHBOARD_KEYS = {
  dashboard: ["dashboard"] as const,
  analytics: (months?: number) => ["dashboard", "analytics", months] as const,
};

// Hook for getting dashboard data
export const useDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
    refetch: refreshDashboard,
  } = useQuery({
    queryKey: DASHBOARD_KEYS.dashboard,
    queryFn: dashboardApi.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if ((error as unknown as ApiError)?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false,
  });

  const {
    data: analytics,
    refetch: refreshAnalytics,
  } = useQuery({
    queryKey: DASHBOARD_KEYS.analytics(6),
    queryFn: () => dashboardApi.getDashboardAnalytics(6),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    throwOnError: false,
  });

  // Handle errors with toast (only show once per error)
  const errorShownRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && errorShownRef.current !== error.toString()) {
      const errorMessage = (error as ApiError)?.error || "Failed to fetch dashboard data";
      errorShownRef.current = error.toString();
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return {
    data,
    analytics,
    loading,
    error: error ? (error as ApiError)?.error || "Failed to fetch dashboard data" : null,
    refreshDashboard: async () => {
      await refreshDashboard();
    },
    refreshAnalytics: async (months = 6) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.analytics(months) });
      await refreshAnalytics();
    },
  };
};
