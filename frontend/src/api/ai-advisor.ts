import { apiClient } from "../lib/api-client";
import type {
  FinancialAdviceRequest,
  FinancialAdviceResponse,
  SpendingAnalysisResponse,
  BudgetRecommendationRequest,
  BudgetRecommendationResponse,
} from "../types/ai-advisor";

export const getFinancialAdvice = async (
  data: FinancialAdviceRequest
): Promise<FinancialAdviceResponse> => {
  return await apiClient.post<FinancialAdviceResponse>("/ai/advice", data);
};

export const analyzeSpending = async (
  period: "month" | "quarter" | "year" = "month"
): Promise<SpendingAnalysisResponse> => {
  return await apiClient.post<SpendingAnalysisResponse>("/ai/analyze", {
    period,
  });
};

export const getBudgetRecommendations = async (
  data: BudgetRecommendationRequest
): Promise<BudgetRecommendationResponse> => {
  return await apiClient.post<BudgetRecommendationResponse>(
    "/ai/budget-recommendations",
    data
  );
};
