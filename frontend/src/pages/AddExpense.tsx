import React from "react";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "@/components/ExpenseForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddExpense = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/expenses");
  };

  const handleCancel = () => {
    navigate("/expenses");
  };

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
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        title="Add New Expense"
      />
    </div>
  );
};

export default AddExpense;
