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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDailyDialog, setShowDailyDialog] = useState(false);
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["revenue_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction")
        .select("*, member_id")
        .order("\"start date\"", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch daily transactions when a date is selected
  const { data: dailyTransactions = [] } = useQuery({
    queryKey: ["daily_transactions", selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const startDate = startOfDay(new Date(selectedDate));
      const endDate = endOfDay(new Date(selectedDate));
      
      const { data, error } = await supabase
        .from("transaction")
        .select("*")
        .gte("start date", startDate.toISOString())
        .lte("start date", endDate.toISOString())
        .neq("status", "incomplete")
        .order("start date", { ascending: true });
        
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedDate,
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
        const transactionDate = parseISO(transaction["start date"]);
        return transactionDate >= monthStart && 
               transactionDate <= monthEnd &&
               transaction.status !== 'incomplete'; // Only count completed transactions
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

  const totalRevenue = transactions
    .filter(t => t.status !== 'incomplete')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

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
          <p className="text-sm text-gray-500">Avg Monthly: Ksh {Math.round(averageMonthlyRevenue).toLocaleString()}</p>
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
                    setSelectedDate(data.date);
                    setShowDailyDialog(true);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Daily Transactions Dialog */}
      <DailyTransactionsDialog
        open={showDailyDialog}
        onOpenChange={setShowDailyDialog}
        date={selectedDate || ''}
        transactions={dailyTransactions}
      />
    </div>
  );
};

export default RevenueChart;