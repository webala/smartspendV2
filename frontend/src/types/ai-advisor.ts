export interface FinancialAdviceRequest {
  question?: string;
  context?: string;
  conversationId?: string;
}

export interface FinancialAdviceResponse {
  advice: string;
  metadata: {
    totalExpenses: number;
    totalIncome: number;
    netSavings: number;
    activeGoals: number;
    expenseCategories: number;
  };
  conversation?: {
    id: string;
    title: string;
    messages: {
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }[];
  };
}

export interface SpendingAnalysisResponse {
  analysis: string;
  data: {
    period: "month" | "quarter" | "year";
    totalExpenses: number;
    totalIncome: number;
    netSavings: number;
    savingsRate: string;
    averageDaily: string;
    expensesByCategory: Record<string, number>;
    topCategories: {
      category: string;
      amount: number;
      percentage: string;
    }[];
  };
}

export interface BudgetRecommendationRequest {
  monthlyIncome: number;
}

export interface BudgetRecommendationResponse {
  recommendations: string;
  currentData: {
    monthlyIncome: number;
    currentExpenses: string;
    currentSavings: string;
    expensesByCategory: Record<string, number>;
    goalsRequiredSavings: number;
    activeGoals: number;
  };
}
