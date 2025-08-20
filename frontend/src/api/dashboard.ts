import { apiClient } from "@/lib/api-client";

export interface DashboardOverview {
  totalExpenses: number;
  monthlyIncome: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  activeGoals: number;
  totalBuddies: number;
}

export interface RecentExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface DashboardGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  progress: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
  isOverdue: boolean;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentExpenses: RecentExpense[];
  goals: DashboardGoal[];
  goalStats: GoalStats;
  currentMonth: string;
  lastUpdated: string;
}

export interface ExpenseTrend {
  month: string;
  amount: number;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}

export interface DashboardAnalytics {
  expenseTrends: ExpenseTrend[];
  categoryBreakdown: CategoryBreakdown[];
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    return apiClient.get<DashboardData>("/dashboard");
  },

  getDashboardAnalytics: async (
    months?: number
  ): Promise<DashboardAnalytics> => {
    const queryParams = new URLSearchParams();
    if (months) queryParams.append("months", months.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/dashboard/analytics${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<DashboardAnalytics>(endpoint);
  },
};
