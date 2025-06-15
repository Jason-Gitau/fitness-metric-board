
import React from "react";
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

interface DueSoonMember {
  member_id: string;
  full_name?: string | null;
  membership_type?: string | null;
  membership_end_date?: string | null;
}

interface Props {
  dueSoonMembers: DueSoonMember[];
}

const UpcomingRenewalsTable: React.FC<Props> = ({ dueSoonMembers }) => {
  if (dueSoonMembers.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 py-8">
        No upcoming renewals 🎉
      </div>
    );
  }

  // Helper to safely calculate days left
  function getDaysLeft(membership_end_date?: string | null): number | string {
    if (!membership_end_date) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = parseISO(membership_end_date);
    if (!isValid(endDate)) return "-";
    const diff = differenceInCalendarDays(endDate, today);
    return !isNaN(diff) ? diff : "-";
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Membership Type</th>
              <th className="px-2 py-2 text-left">End Date</th>
              <th className="px-2 py-2 text-left">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {dueSoonMembers.map((m) => (
              <tr key={m.member_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 font-medium">{m.full_name ?? <span className="italic text-gray-400">—</span>}</td>
                <td className="px-2 py-2">{m.membership_type ?? <span className="italic text-gray-400">—</span>}</td>
                <td className="px-2 py-2">{m.membership_end_date ?? <span className="italic text-gray-400">—</span>}</td>
                <td className="px-2 py-2">
                  {
                    (() => {
                      const val = getDaysLeft(m.membership_end_date);
                      return typeof val === 'number' ? val : <span className="italic text-gray-400">{val}</span>;
                    })()
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingRenewalsTable;
