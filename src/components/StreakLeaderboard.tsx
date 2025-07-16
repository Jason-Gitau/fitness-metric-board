
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

interface Member {
  member_id: string;
  full_name?: string | null;
  total_visits?: number | null;
  last_visit?: string | null;
}

interface LeaderboardEntry {
  member_id: string;
  full_name: string;
  streak_score: number;
  total_visits: number;
}

const PENALTY_MULTIPLIER = 5;

function calculateStreakScore(
  total_visits: number | null | undefined,
  last_visit: string | null | undefined
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let member_last_visit_date: Date | null = null;
  if (last_visit && isValid(parseISO(last_visit))) {
    member_last_visit_date = parseISO(last_visit);
    member_last_visit_date.setHours(0, 0, 0, 0);
  }

  let days_since_last_visit = 9999; // default penalty for no visits

  if (member_last_visit_date) {
    days_since_last_visit = differenceInCalendarDays(today, member_last_visit_date);
  }

  const total = typeof total_visits === "number" ? total_visits : 0;

  // Rule A
  if (days_since_last_visit === 0 || days_since_last_visit === 1) {
    return total; // full score
  }
  // Rule B (skipped >1 days)
  if (days_since_last_visit > 1) {
    const days_skipped = days_since_last_visit - 1;
    const penalty = days_skipped * PENALTY_MULTIPLIER;
    return Math.max(0, total - penalty);
  }
  return total; // fallback (should not reach here)
}

const StreakLeaderboard = () => {
  // Fetch member stats with check-in counts and last visit dates
  const { data: memberStats = [], isLoading, error } = useQuery({
    queryKey: ["member_streak_stats"],
    queryFn: async () => {
      // Get all members with their check-in data
      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          name,
          check_ins(check_in_time)
        `);
      if (error) throw error;
      
      // Process the data to calculate stats for each member
      return (data || []).map(member => {
        const checkIns = member.check_ins || [];
        const totalVisits = checkIns.length;
        
        // Find the most recent check-in date
        let lastVisit = null;
        if (checkIns.length > 0) {
          const sortedCheckIns = checkIns.sort((a, b) => 
            new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
          );
          lastVisit = sortedCheckIns[0].check_in_time;
        }
        
        return {
          member_id: member.id,
          full_name: member.name,
          total_visits: totalVisits,
          last_visit: lastVisit,
        };
      });
    },
  });

  // Calculate leaderboard based on streak scores
  const top5: LeaderboardEntry[] = React.useMemo(() => {
    if (!memberStats.length) return [];
    
    // Calculate streak score for each member and sort
    return memberStats
      .map(member => ({
        member_id: member.member_id,
        full_name: member.full_name || 'Unknown',
        total_visits: member.total_visits || 0,
        streak_score: calculateStreakScore(member.total_visits, member.last_visit),
      }))
      .filter(entry => entry.streak_score > 0) // Only show members with positive streak scores
      .sort((a, b) => b.streak_score - a.streak_score)
      .slice(0, 5);
  }, [memberStats]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
        <Flame strokeWidth={2.2} className="text-orange-500 mr-2" />
        Streak Leadership Board
      </h3>
      {isLoading ? (
        <div className="flex items-center text-gray-400 py-8">
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center text-red-500 py-8">
          Failed to load streak data.
        </div>
      ) : (
        <>
          {top5.length === 0 ? (
            <div className="text-gray-500 py-3">No active streaks yet.</div>
          ) : (
            <ol className="divide-y divide-gray-100">
              {top5.map((entry, idx) => (
                <li
                  key={entry.member_id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-900 mr-4">{idx + 1}</span>
                    <span className="font-medium text-gray-800">{entry.full_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="text-orange-500 w-6 h-6" strokeWidth={2.2} />
                    <span className="text-lg font-bold text-orange-600">
                      {entry.streak_score}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
};

export default StreakLeaderboard;

