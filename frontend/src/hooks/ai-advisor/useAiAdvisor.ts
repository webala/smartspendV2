import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  getFinancialAdvice,
  analyzeSpending,
  getBudgetRecommendations,
} from "@/api/ai-advisor";
import type {
  FinancialAdviceRequest,
  FinancialAdviceResponse,
  SpendingAnalysisResponse,
  BudgetRecommendationRequest,
  BudgetRecommendationResponse,
} from "@/types/ai-advisor";

export const useAiAdvisor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<FinancialAdviceResponse | null>(null);
  const [analysis, setAnalysis] = useState<SpendingAnalysisResponse | null>(
    null
  );
  const [recommendations, setRecommendations] =
    useState<BudgetRecommendationResponse | null>(null);
  const { toast } = useToast();

  const getAdvice = useCallback(
    async (data: FinancialAdviceRequest) => {
      try {
        setIsLoading(true);
        const response = await getFinancialAdvice(data);
        setAdvice(response);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get financial advice",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const getSpendingAnalysis = useCallback(
    async (period: "month" | "quarter" | "year" = "month") => {
      try {
        setIsLoading(true);
        const response = await analyzeSpending(period);
        setAnalysis(response);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to analyze spending",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const getBudgetAdvice = useCallback(
    async (data: BudgetRecommendationRequest) => {
      try {
        setIsLoading(true);
        const response = await getBudgetRecommendations(data);
        setRecommendations(response);
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get budget recommendations",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    advice,
    analysis,
    recommendations,
    getAdvice,
    getSpendingAnalysis,
    getBudgetAdvice,
  };
};


