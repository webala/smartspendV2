import { apiClient } from "@/lib/api-client";
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseListResponse,
  ExpenseFilters,
  ExpenseAnalyticsResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse,
  DeleteExpenseResponse,
} from "@/types/expense";

export const expensesApi = {
  // Get all expenses with optional filters and pagination
  getExpenses: async (
    filters: ExpenseFilters = {}
  ): Promise<ExpenseListResponse> => {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.append("category", filters.category);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/expenses${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<ExpenseListResponse>(endpoint);
  },

  // Create a new expense
  createExpense: async (
    data: CreateExpenseRequest
  ): Promise<CreateExpenseResponse> => {
    return apiClient.post<CreateExpenseResponse>("/expenses", data);
  },

  // Update an existing expense
  updateExpense: async (
    id: string,
    data: UpdateExpenseRequest
  ): Promise<UpdateExpenseResponse> => {
    return apiClient.put<UpdateExpenseResponse>(`/expenses/${id}`, data);
  },

  // Delete an expense
  deleteExpense: async (id: string): Promise<DeleteExpenseResponse> => {
    return apiClient.delete<DeleteExpenseResponse>(`/expenses/${id}`);
  },

  // Get expense analytics
  getExpenseAnalytics: async (
    year?: number,
    month?: number
  ): Promise<ExpenseAnalyticsResponse> => {
    const queryParams = new URLSearchParams();

    if (year) queryParams.append("year", year.toString());
    if (month) queryParams.append("month", month.toString());

    const queryString = queryParams.toString();
    const endpoint = `/expenses/analytics${
      queryString ? `?${queryString}` : ""
    }`;

    return apiClient.get<ExpenseAnalyticsResponse>(endpoint);
  },
};
