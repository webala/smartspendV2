import { apiClient } from "../lib/api-client";
import type {
  Income,
  IncomeFormData,
  IncomeResponse,
  IncomeListResponse,
  IncomeAnalyticsResponse,
} from "../types/income";

export const setIncome = async (
  data: IncomeFormData
): Promise<IncomeResponse> => {
  return await apiClient.post<IncomeResponse>("/income", data);
};

export const getIncomeHistory = async (
  year?: string,
  limit?: number
): Promise<IncomeListResponse> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (limit) params.append("limit", limit.toString());

  return await apiClient.get<IncomeListResponse>(
    `/income?${params.toString()}`
  );
};

export const getIncomeByMonth = async (
  month: string
): Promise<{ income: Income }> => {
  return await apiClient.get<{ income: Income }>(`/income/${month}`);
};

export const deleteIncome = async (
  id: string
): Promise<{ message: string }> => {
  return await apiClient.delete<{ message: string }>(`/income/${id}`);
};

export const getIncomeAnalytics = async (
  year?: string
): Promise<IncomeAnalyticsResponse> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);

  return await apiClient.get<IncomeAnalyticsResponse>(
    `/income/analytics?${params.toString()}`
  );
};
