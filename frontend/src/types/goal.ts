export type GoalCategory =
  | "Savings"
  | "Debt Repayment"
  | "Emergency Fund"
  | "Investment"
  | "Purchase"
  | "Other";

export type GoalStatus = "active" | "completed" | "overdue";

export interface FinancialGoal {
  _id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: GoalCategory;
  progress: number; // Virtual field from backend
  remainingAmount: number; // Virtual field from backend
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  targetAmount: number;
  deadline: string;
  category?: GoalCategory;
  currentAmount?: number;
}

export interface UpdateGoalRequest {
  title?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  category?: GoalCategory;
}

export interface UpdateGoalProgressRequest {
  amount: number;
}

export interface GoalListResponse {
  goals: FinancialGoal[];
  totalGoals: number;
}

export interface GoalFilters {
  category?: GoalCategory;
  status?: GoalStatus;
}

export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  overdueGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
}

export interface GoalAnalyticsResponse {
  analytics: GoalAnalytics;
}

export interface CreateGoalResponse {
  message: string;
  goal: FinancialGoal;
}

export interface UpdateGoalResponse {
  message: string;
  goal: FinancialGoal;
}

export interface DeleteGoalResponse {
  message: string;
}
