
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Calendar,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock data - replace with real API data
  const mockExpenses = [
    { id: 1, description: 'Grocery Shopping', amount: 85.50, category: 'Food', date: '2025-01-15', createdAt: '2025-01-15T10:30:00Z' },
    { id: 2, description: 'Gas Station', amount: 45.00, category: 'Transport', date: '2025-01-14', createdAt: '2025-01-14T16:45:00Z' },
    { id: 3, description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2025-01-13', createdAt: '2025-01-13T09:15:00Z' },
    { id: 4, description: 'Coffee Shop', amount: 12.50, category: 'Food', date: '2025-01-12', createdAt: '2025-01-12T14:20:00Z' },
    { id: 5, description: 'Uber Ride', amount: 18.75, category: 'Transport', date: '2025-01-11', createdAt: '2025-01-11T20:10:00Z' },
    { id: 6, description: 'Movie Theater', amount: 25.00, category: 'Entertainment', date: '2025-01-10', createdAt: '2025-01-10T19:30:00Z' },
  ];

  const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare'];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Transport': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Shopping': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Bills': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Healthcare': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleDelete = (id: number) => {
    console.log('Delete expense:', id);
    // Implement delete logic here
  };

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
            {filteredExpenses.length} expenses totaling ${totalExpenses.toLocaleString()}
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
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
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
        {filteredExpenses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your filters or search term.' 
                  : 'Start by adding your first expense.'}
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
            <Card key={expense.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{expense.description}</h3>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {expense.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${expense.amount}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/expenses/edit/${expense.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(expense.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Expenses;
