export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Other";

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  date?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  totalExpenses: number;
  totalAmount: number;
  currentPage: number;
  totalPages: number;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseAnalytics {
  _id: ExpenseCategory;
  totalAmount: number;
  count: number;
}

export interface ExpenseAnalyticsResponse {
  analytics: ExpenseAnalytics[];
}

export interface CreateExpenseResponse {
  message: string;
  expense: Expense;
}

export interface UpdateExpenseResponse {
  message: string;
  expense: Expense;
}

export interface DeleteExpenseResponse {
  message: string;
}
