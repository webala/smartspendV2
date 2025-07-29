import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/api/expenses";
import type {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
} from "@/types/expense";
import type { ApiError } from "@/lib/api-client";

// Expense query keys
export const EXPENSE_KEYS = {
  all: ["expenses"] as const,
  lists: () => [...EXPENSE_KEYS.all, "list"] as const,
  list: (filters: ExpenseFilters) =>
    [...EXPENSE_KEYS.lists(), filters] as const,
  analytics: () => [...EXPENSE_KEYS.all, "analytics"] as const,
  analyticsWithParams: (year?: number, month?: number) =>
    [...EXPENSE_KEYS.analytics(), { year, month }] as const,
};

// Hook to get expenses with filters
export const useExpenses = (filters: ExpenseFilters = {}) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(filters),
    queryFn: () => expensesApi.getExpenses(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to create an expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.createExpense(data),
    onSuccess: () => {
      // Invalidate and refetch expense lists
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.analytics() });
    },
    onError: (error: ApiError) => {
      console.error("Failed to create expense:", error);
    },
  });
};

// Hook to update an expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      // Invalidate and refetch expense lists
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.analytics() });
    },
    onError: (error: ApiError) => {
      console.error("Failed to update expense:", error);
    },
  });
};

// Hook to delete an expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      // Invalidate and refetch expense lists
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.analytics() });
    },
    onError: (error: ApiError) => {
      console.error("Failed to delete expense:", error);
    },
  });
};

// Hook to get expense analytics
export const useExpenseAnalytics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.analyticsWithParams(year, month),
    queryFn: () => expensesApi.getExpenseAnalytics(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
