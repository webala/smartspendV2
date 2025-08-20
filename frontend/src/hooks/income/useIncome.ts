import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  setIncome,
  getIncomeHistory,
  getIncomeByMonth,
  deleteIncome,
  getIncomeAnalytics,
} from "@/api/income";
import type { Income, IncomeFormData, IncomeAnalytics } from "@/types/income";

export const useIncome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [analytics, setAnalytics] = useState<IncomeAnalytics | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [monthsRecorded, setMonthsRecorded] = useState(0);
  const { toast } = useToast();

  const fetchIncomes = useCallback(
    async (year?: string, limit?: number) => {
      try {
        setIsLoading(true);
        const response = await getIncomeHistory(year, limit);
        setIncomes(response.incomes);
        setTotalIncome(response.totalIncome);
        setMonthsRecorded(response.monthsRecorded);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch income history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const fetchAnalytics = useCallback(
    async (year?: string) => {
      try {
        setIsLoading(true);
        const response = await getIncomeAnalytics(year);
        setAnalytics(response.analytics);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch income analytics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const addIncome = useCallback(
    async (data: IncomeFormData) => {
      try {
        setIsLoading(true);
        await setIncome(data);
        toast({
          title: "Success",
          description: "Income added successfully",
        });
        return true;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add income",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const removeIncome = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        await deleteIncome(id);
        toast({
          title: "Success",
          description: "Income deleted successfully",
        });
        return true;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete income",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    incomes,
    analytics,
    totalIncome,
    monthsRecorded,
    fetchIncomes,
    fetchAnalytics,
    addIncome,
    removeIncome,
  };
};
