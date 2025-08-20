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
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Calendar,
  Target,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  useGoals,
  useDeleteGoal,
  useUpdateGoalProgress,
  useCreateGoal,
  useUpdateGoal,
} from "@/hooks/goals";
import type {
  GoalCategory,
  GoalFilters,
  FinancialGoal,
  CreateGoalRequest,
  UpdateGoalRequest,
} from "@/types/goal";
import { useToast } from "@/hooks/use-toast";
import type { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/utils/currency";

const GOAL_CATEGORIES: GoalCategory[] = [
  "Savings",
  "Debt Repayment",
  "Emergency Fund",
  "Investment",
  "Purchase",
  "Other",
];

const FinancialGoals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GoalCategory | "All"
  >("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "active" | "completed" | "overdue"
  >("All");
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] =
    useState<FinancialGoal | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  // Form states
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: "",
    targetAmount: 0,
    deadline: "",
    category: undefined,
    currentAmount: 0,
  });

  const { toast } = useToast();

  // Prepare filters for API call
  const filters: GoalFilters = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    ...(selectedStatus !== "All" && { status: selectedStatus }),
  };

  const { data: goalData, isLoading, error } = useGoals(filters);
  const deleteGoalMutation = useDeleteGoal();
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const updateProgressMutation = useUpdateGoalProgress();

  const getCategoryColor = (category: GoalCategory) => {
    const colors: { [key in GoalCategory]: string } = {
      Savings:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Debt Repayment":
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "Emergency Fund":
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Investment:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Purchase:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category];
  };

  const getStatusBadge = (goal: FinancialGoal) => {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const isCompleted = goal.progress >= 100;
    const isOverdue = now > deadline && !isCompleted;

    if (isCompleted) {
      return (
        <Badge variant="default" className="bg-green-500">
          Completed
        </Badge>
      );
    } else if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="secondary">Active</Badge>;
    }
  };

  // Filter goals by search term (client-side filtering for title)
  const filteredGoals =
    goalData?.goals?.filter(
      (goal) =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (goal.category &&
          goal.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  const handleDeleteConfirm = async () => {
    if (!deleteGoalId) return;

    try {
      await deleteGoalMutation.mutateAsync(deleteGoalId);
      toast({
        title: "Success!",
        description: "Goal deleted successfully.",
      });
      setDeleteGoalId(null);
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

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGoalMutation.mutateAsync(formData);
      toast({
        title: "Success!",
        description: "Goal created successfully.",
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Create Failed",
        description:
          apiError.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoal = async () => {
    if (
      !editingGoal ||
      !formData.title ||
      !formData.targetAmount ||
      !formData.deadline
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGoalMutation.mutateAsync({
        id: editingGoal._id,
        data: formData as UpdateGoalRequest,
      });
      toast({
        title: "Success!",
        description: "Goal updated successfully.",
      });
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Update Failed",
        description:
          apiError.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProgressUpdate = async () => {
    if (!showProgressDialog || !progressAmount) return;

    try {
      await updateProgressMutation.mutateAsync({
        id: showProgressDialog._id,
        data: { amount: parseFloat(progressAmount) },
      });
      toast({
        title: "Success!",
        description: "Goal progress updated successfully.",
      });
      setShowProgressDialog(null);
      setProgressAmount("");
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Update Failed",
        description:
          apiError.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      targetAmount: 0,
      deadline: "",
      category: undefined,
      currentAmount: 0,
    });
  };

  const openEditDialog = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline.split("T")[0], // Format for date input
      category: goal.category,
      currentAmount: goal.currentAmount,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    const apiError = error as unknown;
    const errorMessage =
      (apiError as ApiError)?.error ||
      "Something went wrong while loading your goals.";

    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Goals
              </h3>
              <p className="text-muted-foreground">{errorMessage}</p>
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
            <Target className="h-8 w-8 text-primary" />
            Financial Goals
          </h1>
          <p className="text-muted-foreground">
            Track and achieve your financial aspirations
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg"
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-xl">Goals Summary</CardTitle>
          <CardDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading goals...
              </div>
            ) : (
              `${filteredGoals.length} goals with ${formatCurrency(
                filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
              )} total target`
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
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {GOAL_CATEGORIES.map((category) => (
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

            <div>
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {["All", "active", "completed", "overdue"].map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(status as any)}
                    className="h-8"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your goals...</p>
            </CardContent>
          </Card>
        ) : filteredGoals.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                selectedCategory !== "All" ||
                selectedStatus !== "All"
                  ? "Try adjusting your filters or search term."
                  : "Start by creating your first financial goal."}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card
              key={goal._id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        {goal.category && (
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                        )}
                        {getStatusBadge(goal)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {formatDate(goal.deadline)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProgressDialog(goal)}
                        title="Update Progress"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteGoalId(goal._id)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteGoalMutation.isPending}
                      >
                        {deleteGoalMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(goal.remainingAmount)} remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Goal Dialog */}
      <Dialog
        open={showCreateDialog || !!editingGoal}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingGoal(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </DialogTitle>
            <DialogDescription>
              {editingGoal
                ? "Update your financial goal details."
                : "Set up a new financial goal to track."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                value={formData.currentAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as GoalCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingGoal(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
              disabled={
                createGoalMutation.isPending || updateGoalMutation.isPending
              }
            >
              {createGoalMutation.isPending || updateGoalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingGoal ? "Updating..." : "Creating..."}
                </>
              ) : editingGoal ? (
                "Update Goal"
              ) : (
                "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog
        open={!!showProgressDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowProgressDialog(null);
            setProgressAmount("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update the current amount for "{showProgressDialog?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="progressAmount">Current Amount</Label>
              <Input
                id="progressAmount"
                type="number"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {showProgressDialog && (
              <div className="text-sm text-muted-foreground">
                Target: {formatCurrency(showProgressDialog.targetAmount)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProgressDialog(null);
                setProgressAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProgressUpdate}
              disabled={updateProgressMutation.isPending}
            >
              {updateProgressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Progress"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteGoalId}
        onOpenChange={() => setDeleteGoalId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGoalMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteGoalMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGoalMutation.isPending ? (
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

export default FinancialGoals;
