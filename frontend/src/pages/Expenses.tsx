import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Calendar,
  Wallet,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useExpenses, useDeleteExpense } from "@/hooks/expenses";
import type { ExpenseCategory, ExpenseFilters } from "@/types/expense";
import { useToast } from "@/hooks/use-toast";
import type { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/utils/currency";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | "All"
  >("All");
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const { toast } = useToast();

  // Prepare filters for API call
  const filters: ExpenseFilters = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    limit: 50, // Get more expenses at once
  };

  const { data: expenseData, isLoading, error } = useExpenses(filters);
  const deleteExpenseMutation = useDeleteExpense();

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: { [key in ExpenseCategory]: string } = {
      Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Transport:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Entertainment:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Bills: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Healthcare:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Education:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Travel:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category];
  };

  // Filter expenses by search term (client-side filtering for description)
  const filteredExpenses =
    expenseData?.expenses?.filter(
      (expense) =>
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleDeleteConfirm = async () => {
    if (!deleteExpenseId) return;

    try {
      await deleteExpenseMutation.mutateAsync(deleteExpenseId);
      toast({
        title: "Success!",
        description: "Expense deleted successfully.",
      });
      setDeleteExpenseId(null);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Delete Failed",
        description:
          apiError.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">
              <Wallet className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Expenses
              </h3>
              <p className="text-muted-foreground">
                {(error as ApiError).error ||
                  "Something went wrong while loading your expenses."}
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            Expenses
          </h1>
          <p className="text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link to="/expenses/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Expense
          </Link>
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-xl">Expense Summary</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading expenses...
              </div>
            ) : (
              `${filteredExpenses.length} expenses totaling ${formatCurrency(
                expenseData?.totalAmount || 0
              )}`
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("All")}
                className="h-8"
              >
                All
              </Button>
              {EXPENSE_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-8"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your expenses...</p>
            </CardContent>
          </Card>
        ) : filteredExpenses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your filters or search term."
                  : "Start by adding your first expense."}
              </p>
              <Button asChild>
                <Link to="/expenses/add">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Expense
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card
              key={expense._id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {expense.description || "No description"}
                      </h3>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/expenses/edit/${expense._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteExpenseId(expense._id)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteExpenseMutation.isPending}
                      >
                        {deleteExpenseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteExpenseId}
        onOpenChange={() => setDeleteExpenseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExpenseMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteExpenseMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExpenseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
