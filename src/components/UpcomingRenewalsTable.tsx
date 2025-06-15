
import React from "react";
import { differenceInCalendarDays, format } from "date-fns";
import type { TestMember } from "@/utils/memberCategorization";
import { Calendar } from "lucide-react";

interface Props {
  dueSoonMembers: TestMember[];
}

const badgeColor = (daysLeft: number) => {
  if (daysLeft <= 3) return "bg-red-100 text-red-700";
  if (daysLeft <= 7) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const UpcomingRenewalsTable: React.FC<Props> = ({ dueSoonMembers }) => {
  if (dueSoonMembers.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 py-8">
        No upcoming renewals
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Membership Type</th>
              <th className="px-2 py-2 text-left">End Date</th>
              <th className="px-2 py-2 text-center">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {dueSoonMembers.map((m) => {
              const end = m.membership_end_date ? new Date(m.membership_end_date) : null;
              const daysLeft = end ? differenceInCalendarDays(end, new Date()) : "-";
              return (
                <tr
                  key={m.member_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-2 py-2 font-medium">{m.full_name}</td>
                  <td className="px-2 py-2">{m.membership_type}</td>
                  <td className="px-2 py-2">{end ? format(end, "MMM d, yyyy") : "-"}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${badgeColor(daysLeft)}`}>
                      {typeof daysLeft === "number" ? daysLeft : "-"}
                      {typeof daysLeft === "number"
                        ? ` day${daysLeft === 1 ? "" : "s"} left`
                        : ""}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingRenewalsTable;
