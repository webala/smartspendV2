import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/expenses";
import ExpenseForm from "@/components/ExpenseForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const EditExpense = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get expenses to find the one being edited
  const { data: expenseData, isLoading, error } = useExpenses();

  const expense = expenseData?.expenses?.find((exp) => exp._id === id);

  const handleSuccess = () => {
    navigate("/expenses");
  };

  const handleCancel = () => {
    navigate("/expenses");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/expenses")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Button>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading expense details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/expenses")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Button>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expense Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The expense you're trying to edit could not be found.
            </p>
            <Button onClick={() => navigate("/expenses")}>
              Back to Expenses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/expenses")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Button>
      </div>

      {/* Form */}
      <ExpenseForm
        expense={expense}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        title="Edit Expense"
      />
    </div>
  );
};

export default EditExpense;
