import { useState, useEffect } from "react";
import { useAiAdvisor } from "@/hooks/ai-advisor";
import { useConversations } from "@/hooks/conversations/useConversations";
import { Button } from "@/components/ui/button";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Chart } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AiAdvisor = () => {
  const {
    isLoading: isAiLoading,
    advice,
    analysis,
    recommendations,
    getAdvice,
    getSpendingAnalysis,
    getBudgetAdvice,
  } = useAiAdvisor();

  const {
    isLoading: isConversationsLoading,
    conversations,
    currentConversation,
    fetchConversations,
    fetchConversation,
    startNewConversation,
    removeConversation,
    updateCurrentConversation,
    checkContextLimit,
  } = useConversations();

  const [question, setQuestion] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleGetAdvice = async () => {
    if (!question.trim()) return;

    let targetConversation = currentConversation;
    if (!targetConversation) {
      // Start new conversation if none selected
      targetConversation = await startNewConversation(
        question.slice(0, 50) + "..."
      );
      if (!targetConversation) return;
    }

    // Check context limit
    if (checkContextLimit(targetConversation)) {
      const newConversation = await startNewConversation(
        question.slice(0, 50) + "..."
      );
      if (!newConversation) return;
      targetConversation = newConversation;
    }

    const response = await getAdvice({
      question,
      conversationId: targetConversation._id,
    });

    if (response?.conversation) {
      // Convert the response conversation format to match our Conversation type
      updateCurrentConversation({
        _id: response.conversation.id,
        title: response.conversation.title,
        messages: response.conversation.messages,
        lastUpdated: new Date().toISOString(),
        isActive: true,
      });
    }
  };

  const handleAnalyzeSpending = async () => {
    await getSpendingAnalysis(selectedPeriod);
  };

  const handleGetBudgetAdvice = async () => {
    if (!monthlyIncome) return;
    await getBudgetAdvice({ monthlyIncome: Number(monthlyIncome) });
  };

  const handleSelectConversation = async (conversationId: string) => {
    const conversation = await fetchConversation(conversationId);
    if (conversation) {
      updateCurrentConversation(conversation);
    }
  };

  const isLoading = isAiLoading || isConversationsLoading;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversation?._id}
        onConversationSelect={handleSelectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={removeConversation}
        isLoading={isConversationsLoading}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
          <p className="text-muted-foreground">
            Get personalized financial advice and insights
          </p>
        </div>

        {currentConversation && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h2 className="font-medium mb-2">Current Conversation</h2>
            <p className="text-sm text-muted-foreground">
              {currentConversation.messages.length} messages in conversation
            </p>
          </div>
        )}

        <Tabs defaultValue="advice" className="space-y-6">
          <TabsList>
            <TabsTrigger value="advice">Ask for Advice</TabsTrigger>
            <TabsTrigger value="analysis">Spending Analysis</TabsTrigger>
            <TabsTrigger value="budget">Budget Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="advice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ask a Financial Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Ask anything about your finances..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGetAdvice}
                  disabled={isLoading || !question.trim()}
                >
                  Get Advice
                </Button>
              </CardContent>
            </Card>

            {advice && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Advice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Total Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(advice.metadata.totalIncome)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Total Expenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(advice.metadata.totalExpenses)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Net Savings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(advice.metadata.netSavings)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Active Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {advice.metadata.activeGoals}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[300px]">
                        <div
                          className="prose prose-sm dark:prose-invert"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {advice.advice}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Spending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Time Period</Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value: "month" | "quarter" | "year") =>
                      setSelectedPeriod(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAnalyzeSpending} disabled={isLoading}>
                  Analyze Spending
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Total Expenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(analysis.data.totalExpenses)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Daily Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(Number(analysis.data.averageDaily))}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Savings Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {analysis.data.savingsRate}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {analysis.data.topCategories.length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Spending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Chart
                        type="bar"
                        data={{
                          labels: analysis.data.topCategories.map(
                            (cat) => cat.category
                          ),
                          datasets: [
                            {
                              label: "Amount",
                              data: analysis.data.topCategories.map(
                                (cat) => cat.amount
                              ),
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[300px]">
                        <div
                          className="prose prose-sm dark:prose-invert"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {analysis.analysis}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Budget Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="Enter your monthly income"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGetBudgetAdvice}
                  disabled={isLoading || !monthlyIncome}
                >
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Monthly Income
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            recommendations.currentData.monthlyIncome
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Current Expenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            Number(recommendations.currentData.currentExpenses)
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Current Savings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            Number(recommendations.currentData.currentSavings)
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Active Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {recommendations.currentData.activeGoals}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Current Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Chart
                        type="bar"
                        data={{
                          labels: Object.keys(
                            recommendations.currentData.expensesByCategory
                          ),
                          datasets: [
                            {
                              label: "Amount",
                              data: Object.values(
                                recommendations.currentData.expensesByCategory
                              ),
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[300px]">
                        <div
                          className="prose prose-sm dark:prose-invert"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {recommendations.recommendations}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AiAdvisor;
