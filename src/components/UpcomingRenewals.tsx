
import React from 'react';
import { Calendar } from 'lucide-react';

const renewalData = [
  { id: 1, name: 'Sarah Johnson', endDate: '2024-06-18', daysLeft: 3, type: 'Premium' },
  { id: 2, name: 'Mike Wilson', endDate: '2024-06-20', daysLeft: 5, type: 'Standard' },
  { id: 3, name: 'Emily Davis', endDate: '2024-06-22', daysLeft: 7, type: 'Premium' },
  { id: 4, name: 'John Smith', endDate: '2024-06-25', daysLeft: 10, type: 'Basic' },
  { id: 5, name: 'Lisa Brown', endDate: '2024-06-28', daysLeft: 13, type: 'Premium' },
];

const UpcomingRenewals = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {renewalData.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{member.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  member.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                  member.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {member.daysLeft} days left
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">{member.type} Plan</span>
                <span className="text-sm text-gray-500">{member.endDate}</span>
              </div>
            </div>
          </div>
        ))}
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
