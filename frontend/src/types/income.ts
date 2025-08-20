export interface Income {
  _id: string;
  userId: string;
  amount: number;
  month: string; // YYYY-MM format
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeAnalytics {
  totalIncome: number;
  averageIncome: number;
  monthsRecorded: number;
  highestIncome: number;
  lowestIncome: number;
  monthlyData: {
    month: string;
    amount: number;
    description?: string;
  }[];
}

export interface IncomeFormData {
  amount: number;
  month: string;
  description?: string;
}

export interface IncomeResponse {
  message: string;
  income: Income;
}

export interface IncomeListResponse {
  incomes: Income[];
  totalIncome: number;
  monthsRecorded: number;
}

export interface IncomeAnalyticsResponse {
  analytics: IncomeAnalytics;
}
