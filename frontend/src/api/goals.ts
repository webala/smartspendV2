import { apiClient } from "@/lib/api-client";
import type {
  FinancialGoal,
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateGoalProgressRequest,
  GoalListResponse,
  GoalFilters,
  GoalAnalyticsResponse,
  CreateGoalResponse,
  UpdateGoalResponse,
  DeleteGoalResponse,
} from "@/types/goal";

export const goalsApi = {
  // Get all goals with optional filters
  getGoals: async (filters: GoalFilters = {}): Promise<GoalListResponse> => {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.append("category", filters.category);
    if (filters.status) queryParams.append("status", filters.status);

    const queryString = queryParams.toString();
    const endpoint = `/goals${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<GoalListResponse>(endpoint);
  },

  // Create a new goal
  createGoal: async (data: CreateGoalRequest): Promise<CreateGoalResponse> => {
    return apiClient.post<CreateGoalResponse>("/goals", data);
  },

  // Update an existing goal
  updateGoal: async (
    id: string,
    data: UpdateGoalRequest
  ): Promise<UpdateGoalResponse> => {
    return apiClient.put<UpdateGoalResponse>(`/goals/${id}`, data);
  },

  // Delete a goal
  deleteGoal: async (id: string): Promise<DeleteGoalResponse> => {
    return apiClient.delete<DeleteGoalResponse>(`/goals/${id}`);
  },

  // Update goal progress
  updateGoalProgress: async (
    id: string,
    data: UpdateGoalProgressRequest
  ): Promise<UpdateGoalResponse> => {
    return apiClient.put<UpdateGoalResponse>(`/goals/${id}/progress`, data);
  },

  // Get goal analytics
  getGoalAnalytics: async (): Promise<GoalAnalyticsResponse> => {
    return apiClient.get<GoalAnalyticsResponse>("/goals/analytics");
  },
};
