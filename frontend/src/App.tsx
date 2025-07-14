
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="expense-tracker-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="expenses/add" element={<div className="p-8 text-center"><h1 className="text-2xl">Add Expense Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="expenses/edit/:id" element={<div className="p-8 text-center"><h1 className="text-2xl">Edit Expense Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="goals" element={<div className="p-8 text-center"><h1 className="text-2xl">Financial Goals Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="income" element={<div className="p-8 text-center"><h1 className="text-2xl">Income Management Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="buddies" element={<div className="p-8 text-center"><h1 className="text-2xl">Buddies Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="ai" element={<div className="p-8 text-center"><h1 className="text-2xl">AI Financial Advisor</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
