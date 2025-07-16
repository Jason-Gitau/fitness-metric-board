import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const MemberGrowthChart = () => {
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["members_growth"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const growthData = React.useMemo(() => {
    if (!members.length) return [];

    const now = new Date();
    const startDate = subMonths(now, 11); // Last 12 months
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Count members who joined up to this month (cumulative)
      const cumulativeCount = members.filter(member => {
        const joinDate = parseISO(member.created_at);
        return joinDate <= monthEnd;
      }).length;

      // Count new members this month
      const newThisMonth = members.filter(member => {
        const joinDate = parseISO(member.created_at);
        return joinDate >= monthStart && joinDate <= monthEnd;
      }).length;

      return {
        month: format(month, 'MMM yyyy'),
        total: cumulativeCount,
        new: newThisMonth,
      };
    });

    return monthlyData;
  }, [members]);

  const totalMembers = members.length;
  const recentGrowth = growthData.length >= 2 
    ? growthData[growthData.length - 1].total - growthData[growthData.length - 2].total 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Member Growth</h3>
          <p className="text-sm text-gray-500">Total: {totalMembers} members</p>
        </div>
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">+{recentGrowth} this month</span>
        </div>
      </div>
      
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-400" />
            Loading growth data...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load member growth data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'total' ? 'Total Members' : 'New Members'
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="total"
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="new"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MemberGrowthChart;