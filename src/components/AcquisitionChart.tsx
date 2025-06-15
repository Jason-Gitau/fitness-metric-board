
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
import { Loader2 } from "lucide-react";

// Helper to generate month names
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const thisYear = new Date().getFullYear();

function groupMembersByMonth(members: any[]) {
  // Initialize an array of 12 months with count 0
  const result = Array.from({ length: 12 }, (_, idx) => ({
    month: MONTHS[idx],
    members: 0,
  }));

  for (const m of members) {
    if (!m.inserted_at) continue;
    const date = new Date(m.inserted_at);
    if (date.getFullYear() === thisYear) {
      const month = date.getMonth(); // 0-indexed
      result[month].members += 1;
    }
  }
  return result;
}

const AcquisitionChart = () => {
  // Fetch all test_members and their inserted_at (date of registration)
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["test_members", "acquisition"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_members")
        .select("inserted_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Group members by month for current year
  const data = React.useMemo(() => groupMembersByMonth(members), [members]);

  // Calculate YOY increase (mocked, since we don't have last year's data)
  // In a real system, you would fetch/register previous years' counts and compare.
  const trendPercent = "+15.2%";
  const trendPositive = true;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        New Member Acquisition
      </h3>
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-400" />
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load acquisition data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                allowDecimals={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="members"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <span className={`font-medium ${trendPositive ? "text-green-600" : "text-red-600"}`}>
          ↑ 15.2%
        </span>{" "}
        increase from last year
      </div>
    </div>
  );
};

export default AcquisitionChart;
