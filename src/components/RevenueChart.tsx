import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, startOfDay, endOfDay } from 'date-fns';
import DailyTransactionsDialog from './DailyTransactionsDialog';

const RevenueChart = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMonthlyDialog, setShowMonthlyDialog] = useState(false);
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["revenue_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, member_id")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch monthly transactions when a month is selected
  const { data: monthlyTransactions = [] } = useQuery({
    queryKey: ["monthly_transactions", selectedMonth],
    queryFn: async () => {
      if (!selectedMonth) return [];
      
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("start_date", monthStart.toISOString())
        .lte("start_date", monthEnd.toISOString())
        .eq("status", "complete")
        .order("start_date", { ascending: true });
        
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedMonth,
  });

  const revenueData = React.useMemo(() => {
    if (!transactions.length) return [];

    const now = new Date();
    const startDate = subMonths(now, 11); // Last 12 months
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    const monthlyRevenue = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(transaction => {
        if (!transaction.start_date) return false;
        try {
          const transactionDate = parseISO(transaction.start_date);
          return !isNaN(transactionDate.getTime()) &&
                 transactionDate >= monthStart && 
                 transactionDate <= monthEnd &&
                 transaction.status === 'complete'; // Only count completed transactions
        } catch (error) {
          console.warn('Invalid date in transaction:', transaction.start_date);
          return false;
        }
      });

      const totalRevenue = monthTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const transactionCount = monthTransactions.length;

      return {
        month: format(month, 'MMM yyyy'),
        revenue: totalRevenue,
        transactions: transactionCount,
        date: format(monthStart, 'yyyy-MM-dd'),
      };
    });

    return monthlyRevenue;
  }, [transactions]);

  // Calculate insights for completed transactions only
  const completedTransactions = transactions.filter(t => t.status === 'complete');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  // Today's revenue insights
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const todayTransactions = completedTransactions.filter(t => {
    if (!t.start_date) return false;
    const transactionDate = new Date(t.start_date);
    return transactionDate >= todayStart && transactionDate <= todayEnd;
  });
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  // Payment method breakdown for current month
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const currentMonthTransactions = completedTransactions.filter(t => {
    if (!t.start_date) return false;
    const transactionDate = new Date(t.start_date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });
  
  const paymentMethodBreakdown = currentMonthTransactions.reduce((acc, t) => {
    const method = t.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + Number(t.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const averageMonthlyRevenue = revenueData.length > 0 
    ? totalRevenue / revenueData.length 
    : 0;

  const currentMonthRevenue = revenueData.length > 0 
    ? revenueData[revenueData.length - 1].revenue 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <p className="text-sm text-gray-500">Today: Ksh {todayRevenue.toLocaleString()} • Avg Monthly: Ksh {Math.round(averageMonthlyRevenue).toLocaleString()}</p>
          <div className="text-xs text-gray-400 mt-1">
            Cash: Ksh {(paymentMethodBreakdown.cash || 0).toLocaleString()} • 
            M-Pesa: Ksh {(paymentMethodBreakdown.mpesa || 0).toLocaleString()} this month
          </div>
        </div>
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Ksh {currentMonthRevenue.toLocaleString()} this month</span>
        </div>
      </div>
      
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-400" />
            Loading revenue data...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load revenue data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `Ksh ${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `Ksh ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Transactions'
                ]}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="revenue"
                className="cursor-pointer"
                onClick={(data) => {
                  if (data && data.date) {
                    setSelectedMonth(data.date);
                    setShowMonthlyDialog(true);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Monthly Transactions Dialog */}
      <DailyTransactionsDialog
        open={showMonthlyDialog}
        onOpenChange={setShowMonthlyDialog}
        date={selectedMonth || ''}
        transactions={monthlyTransactions}
        isMonthly={true}
      />
    </div>
  );
};

export default RevenueChart;