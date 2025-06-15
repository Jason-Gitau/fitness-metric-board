
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";
import { Loader2 } from "lucide-react";

// Category definitions and matching colors.
const CATEGORIES = [
  { name: "Active", color: "#10b981" },
  { name: "Expired", color: "#f59e0b" },
  { name: "Suspended", color: "#ef4444" },
  { name: "Pending", color: "#6b7280" },
];

// Utility: categorize members by status.
function categorizeMember(member) {
  // "Expired": membership_end_date is in the past (today or before) and payment_status is not 'paid'
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = member.membership_end_date
    ? parseISO(member.membership_end_date)
    : null;
  const paymentStatus = (member.payment_status || "").toLowerCase();
  // Suspended if set, else other rules (example: demo only)
  if (paymentStatus === "suspended") return "Suspended";
  if (
    endDate &&
    isValid(endDate) &&
    differenceInCalendarDays(today, endDate) >= 0 &&
    paymentStatus !== "paid"
  ) {
    return "Expired";
  }
  // Pending (using status "pending" or "awaiting" in payment_status)
  if (paymentStatus === "pending" || paymentStatus === "awaiting") return "Pending";
  // Default: Active
  return "Active";
}

const MembershipChart = () => {
  // Query members from database
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["test_members"],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("test_members")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Count each category from live data
  const counts = React.useMemo(() => {
    const stats = { Active: 0, Expired: 0, Suspended: 0, Pending: 0 };
    for (const m of members) {
      const category = categorizeMember(m);
      if (stats[category] !== undefined) stats[category]++;
    }
    return stats;
  }, [members]);

  // Pie data in chart library format
  const chartData = CATEGORIES.map((cat) => ({
    ...cat,
    value: counts[cat.name],
  }));

  // Compute total for percentages
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[424px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Membership Status
      </h3>
      <div className="h-64 relative flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-400" />
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load membership status.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine
                label={({ name, percent, value }) =>
                  value > 0
                    ? `${name} ${total ? Math.round((value / total) * 100) : 0}%`
                    : ""
                }
                isAnimationActive={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                formatter={(value) => {
                  const color = CATEGORIES.find((c) => c.name === value)?.color;
                  return (
                    <span style={{ color }}>{value}</span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Custom Legend underneath */}
      {!isLoading && !error && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span
                className="text-sm"
                style={{ color: item.color }}
              >
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembershipChart;
