
import React from "react";
import { Users } from "lucide-react";

interface InactiveDetail {
  member_id: string;
  full_name?: string | null;
  reason: string;
}

interface Props {
  inactiveMembers: InactiveDetail[];
}

const InactiveMembersTable: React.FC<Props> = ({ inactiveMembers }) => {
  if (inactiveMembers.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 py-8">
        No inactive members 🎉
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 mr-2 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Inactive Members</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {inactiveMembers.map((m) => (
              <tr key={m.member_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 font-medium">{m.full_name}</td>
                <td className="px-2 py-2">{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InactiveMembersTable;
