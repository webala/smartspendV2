import { useEffect, useState } from "react";
import { useIncome } from "@/hooks/income";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart } from "../components/ui/chart";
import { formatCurrency } from "@/utils/currency";

const Income = () => {
  const {
    isLoading,
    incomes,
    analytics,
    totalIncome,
    monthsRecorded,
    fetchIncomes,
    fetchAnalytics,
    addIncome,
    removeIncome,
  } = useIncome();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [formData, setFormData] = useState({
    amount: "",
    month: "",
    description: "",
  });

  useEffect(() => {
    fetchIncomes(selectedYear);
    fetchAnalytics(selectedYear);
  }, [fetchIncomes, fetchAnalytics, selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addIncome({
      amount: Number(formData.amount),
      month: formData.month,
      description: formData.description,
    });

    if (success) {
      setIsAddDialogOpen(false);
      setFormData({ amount: "", month: "", description: "" });
      fetchIncomes(selectedYear);
      fetchAnalytics(selectedYear);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await removeIncome(id);
    if (success) {
      fetchIncomes(selectedYear);
      fetchAnalytics(selectedYear);
    }
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  ).map((year) => year.toString());

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: `${selectedYear}-${month.toString().padStart(2, "0")}`,
      label: new Date(2000, i).toLocaleString("default", { month: "long" }),
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="text-muted-foreground">
            Track and manage your monthly income
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Income</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, month: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Add a description"
                />
              </div>
              <Button type="submit" className="w-full">
                Save Income
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                formatCurrency(totalIncome)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                formatCurrency(analytics?.averageIncome || 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Highest Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                formatCurrency(analytics?.highestIncome || 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Months Recorded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-32" /> : monthsRecorded}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Income Trend</CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <Chart
              type="bar"
              data={{
                labels: analytics?.monthlyData.map((d) => d.month) || [],
                datasets: [
                  {
                    label: "Monthly Income",
                    data: analytics?.monthlyData.map((d) => d.amount) || [],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              className="h-[350px]"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {incomes.map((income) => (
                  <Card key={income._id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">
                          {new Date(income.month + "-01").toLocaleString(
                            "default",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {income.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">
                          {formatCurrency(income.amount)}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(income._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;
