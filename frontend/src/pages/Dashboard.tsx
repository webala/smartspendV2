import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Target,
  TrendingUp,
  PlusCircle,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import { useDashboard } from "@/hooks/dashboard";

const Dashboard = () => {
  const { data, loading, error, refreshDashboard } = useDashboard();

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Loading Dashboard... ⏳
          </h1>
          <p className="text-muted-foreground text-lg">
            Fetching your financial overview
          </p>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Oops! Something went wrong 😞
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            {error || "Failed to load dashboard data"}
          </p>
          <Button onClick={refreshDashboard} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { overview, recentExpenses, goals } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's your financial overview for this month
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshDashboard}
          className="mt-2 gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overview.remainingBudget)} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeGoals}</div>
            <p className="text-xs text-muted-foreground">Goals in progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buddies</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalBuddies}</div>
            <p className="text-xs text-muted-foreground">Financial partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Overview
          </CardTitle>
          <CardDescription>
            You've used {overview.budgetUsedPercentage.toFixed(1)}% of your
            monthly budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overview.budgetUsedPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Spent: {formatCurrency(overview.totalExpenses)}
              </span>
              <span className="text-muted-foreground">
                Budget: {formatCurrency(overview.monthlyIncome)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Expenses
              </CardTitle>
              <CardDescription>Your latest spending activity</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/expenses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                    <span className="font-bold text-lg">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No recent expenses
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/expenses/add">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Expense
                    </Link>
                  </Button>
                </div>
              )}
              {recentExpenses.length > 0 && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/expenses/add">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Expense
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Financial Goals
              </CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/goals">Manage Goals</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(goal.current)} /{" "}
                        {formatCurrency(goal.target)}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {goal.progress.toFixed(1)}% complete
                      </p>
                      {goal.isOverdue && (
                        <span className="text-xs text-red-500 font-medium">
                          Overdue
                        </span>
                      )}
                      {goal.isCompleted && (
                        <span className="text-xs text-green-500 font-medium">
                          Completed! 🎉
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No financial goals yet
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/goals">
                      <Target className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
