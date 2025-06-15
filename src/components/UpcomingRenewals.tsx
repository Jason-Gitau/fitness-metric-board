
import React from 'react';
import { Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RenewalMember {
  id: string | number;
  name: string;
  endDate: string;
  daysLeft: number;
  type: string;
}

const fetchRenewals = async (): Promise<RenewalMember[]> => {
  const response = await fetch("https://naturally-tolerant-leech.ngrok-free.app/webhook-test/aaf490a5-efb5-4485-b5cd-668dab47417d");
  if (!response.ok) throw new Error("Failed to fetch renewals");
  // Example expected response:
  // [{ id, name, endDate, daysLeft, type }, ...]
  return response.json();
};

const badgeColor = (daysLeft: number) => {
  if (daysLeft <= 3) return 'bg-red-100 text-red-700';
  if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

const UpcomingRenewals = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["upcoming-renewals"],
    queryFn: fetchRenewals,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1 overflow-y-auto max-h-80 custom-scroll">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-400">Loading...</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-12 text-red-500">
            Failed to load data.
          </div>
        )}
        {/* No Data State */}
        {!isLoading && !error && data && data.length === 0 && (
          <div className="flex items-center justify-center py-10 text-gray-400">
            No upcoming renewals
          </div>
        )}
        {/* Renewals List */}
        <div className="space-y-3">
          {data && data.map((member: RenewalMember) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">{member.type} Plan</div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-xs px-2 py-1 mb-1 rounded-full ${badgeColor(member.daysLeft)}`}
                  style={{ minWidth: 78, textAlign: "center" }}
                >
                  {member.daysLeft} {member.daysLeft === 1 ? "day" : "days"} left
                </span>
                <span className="text-gray-500 text-sm font-medium">{member.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
          View All Renewals
        </button>
      </div>
    </div>
  );
};

export default UpcomingRenewals;
