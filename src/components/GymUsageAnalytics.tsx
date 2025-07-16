import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, Users, Activity } from "lucide-react";
import { format, parseISO, getHours } from 'date-fns';

const GymUsageAnalytics = () => {
  const { data: checkIns = [], isLoading, error } = useQuery({
    queryKey: ["gym_usage_analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("duration, check_in_time, \"checkout time\"")
        .not("check_in_time", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const analytics = React.useMemo(() => {
    if (!checkIns.length) {
      return {
        avgDuration: 0,
        hourlyCheckIns: [],
        hourlyCheckOuts: [],
        totalSessions: 0
      };
    }

    // Calculate average duration (convert time string to minutes)
    const validDurations = checkIns.filter(c => c.duration);
    const avgDuration = validDurations.length > 0 
      ? validDurations.reduce((sum, c) => {
          // Parse duration string (HH:mm:ss format) to minutes
          const [hours, minutes] = c.duration.split(':').map(Number);
          return sum + (hours * 60 + minutes);
        }, 0) / validDurations.length 
      : 0;

    // Hourly check-in distribution
    const hourlyCheckInCounts = Array(24).fill(0);
    const hourlyCheckOutCounts = Array(24).fill(0);

    checkIns.forEach(checkIn => {
      if (checkIn.check_in_time) {
        const hour = getHours(parseISO(checkIn.check_in_time));
        hourlyCheckInCounts[hour]++;
      }
      if (checkIn["checkout time"]) {
        const hour = getHours(parseISO(checkIn["checkout time"]));
        hourlyCheckOutCounts[hour]++;
      }
    });

    const hourlyCheckIns = hourlyCheckInCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      checkIns: count,
    }));

    const hourlyCheckOuts = hourlyCheckOutCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      checkOuts: count,
    }));

    return {
      avgDuration: Math.round(avgDuration),
      hourlyCheckIns,
      hourlyCheckOuts,
      totalSessions: checkIns.length
    };
  }, [checkIns]);

  const peakCheckInHour = analytics.hourlyCheckIns.reduce((max, current) => 
    current.checkIns > max.checkIns ? current : max, 
    { hour: '0:00', checkIns: 0 }
  );

  const peakCheckOutHour = analytics.hourlyCheckOuts.reduce((max, current) => 
    current.checkOuts > max.checkOuts ? current : max, 
    { hour: '0:00', checkOuts: 0 }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Gym Usage Analytics</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-400" />
          Loading usage data...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          Failed to load usage data.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600">Total Check Ins</p>
                  <p className="text-xl font-bold text-blue-800">{analytics.totalSessions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600">Avg. Duration</p>
                  <p className="text-xl font-bold text-green-800">{analytics.avgDuration} min</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm text-orange-600">Peak Check-in</p>
                  <p className="text-xl font-bold text-orange-800">{peakCheckInHour.hour}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600">Peak Check-out</p>
                  <p className="text-xl font-bold text-purple-800">{peakCheckOutHour.hour}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Traffic Chart */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Hourly Traffic Pattern</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.hourlyCheckIns.map((item, index) => ({
                  ...item,
                  checkOuts: analytics.hourlyCheckOuts[index].checkOuts
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    interval={2}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value,
                      name === 'checkIns' ? 'Check-ins' : 'Check-outs'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkIns"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    name="checkIns"
                  />
                  <Line
                    type="monotone"
                    dataKey="checkOuts"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    name="checkOuts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymUsageAnalytics;