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
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";

const Dashboard = () => {
  // Mock data - replace with real data from your API
  const mockData = {
    totalExpenses: 245075, // KES
    monthlyIncome: 500000, // KES
    activeGoals: 3,
    totalBuddies: 5,
    recentExpenses: [
      {
        id: 1,
        description: "Grocery Shopping",
        amount: 8550,
        category: "Food",
        date: "2025-01-15",
      },
      {
        id: 2,
        description: "Gas Station",
        amount: 4500,
        category: "Transport",
        date: "2025-01-14",
      },
      {
        id: 3,
        description: "Netflix Subscription",
        amount: 1599,
        category: "Entertainment",
        date: "2025-01-13",
      },
    ],
    goals: [
      {
        id: 1,
        title: "Emergency Fund",
        current: 250000,
        target: 500000,
        progress: 50,
      },
      {
        id: 2,
        title: "Vacation Savings",
        current: 75000,
        target: 200000,
        progress: 37.5,
      },
      {
        id: 3,
        title: "New Laptop",
        current: 30000,
        target: 120000,
        progress: 25,
      },
    ],
  };

  const remainingBudget = mockData.monthlyIncome - mockData.totalExpenses;
  const budgetUsedPercentage =
    (mockData.totalExpenses / mockData.monthlyIncome) * 100;

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
              {formatCurrency(mockData.totalExpenses)}
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
              {formatCurrency(mockData.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(remainingBudget)} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeGoals}</div>
            <p className="text-xs text-muted-foreground">Goals in progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buddies</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalBuddies}</div>
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
            You've used {budgetUsedPercentage.toFixed(1)}% of your monthly
            budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={budgetUsedPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Spent: {formatCurrency(mockData.totalExpenses)}
              </span>
              <span className="text-muted-foreground">
                Budget: {formatCurrency(mockData.monthlyIncome)}
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
              {mockData.recentExpenses.map((expense) => (
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
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link to="/expenses/add">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Expense
                </Link>
              </Button>
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
              {mockData.goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(goal.current)} /{" "}
                      {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {goal.progress.toFixed(1)}% complete
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
