import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@/api/goals";
import type {
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateGoalProgressRequest,
  GoalFilters,
} from "@/types/goal";
import type { ApiError } from "@/lib/api-client";

// Goal query keys
export const GOAL_KEYS = {
  all: ["goals"] as const,
  lists: () => [...GOAL_KEYS.all, "list"] as const,
  list: (filters: GoalFilters) => [...GOAL_KEYS.lists(), filters] as const,
  analytics: () => [...GOAL_KEYS.all, "analytics"] as const,
};

// Hook to get goals with filters
export const useGoals = (filters: GoalFilters = {}) => {
  return useQuery({
    queryKey: GOAL_KEYS.list(filters),
    queryFn: () => goalsApi.getGoals(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to get goal analytics
export const useGoalAnalytics = () => {
  return useQuery({
    queryKey: GOAL_KEYS.analytics(),
    queryFn: () => goalsApi.getGoalAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create a goal
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, CreateGoalRequest>({
    mutationFn: goalsApi.createGoal,
    onSuccess: () => {
      // Invalidate goals queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: GOAL_KEYS.all });
    },
  });
};

// Hook to update a goal
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, { id: string; data: UpdateGoalRequest }>({
    mutationFn: ({ id, data }) => goalsApi.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_KEYS.all });
    },
  });
};

// Hook to delete a goal
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, string>({
    mutationFn: goalsApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_KEYS.all });
    },
  });
};

// Hook to update goal progress
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    ApiError,
    { id: string; data: UpdateGoalProgressRequest }
  >({
    mutationFn: ({ id, data }) => goalsApi.updateGoalProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOAL_KEYS.all });
    },
  });
};
